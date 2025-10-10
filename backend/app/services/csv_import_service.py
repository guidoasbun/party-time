"""CSV import service for bulk guest creation."""
from typing import List, Dict, Set, Optional
from uuid import UUID
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.csv_parser import CSVParser
from app.crud import crud_guest
from app.schemas.guest import GuestCreate


class DuplicateDetail:
    """Details about a duplicate guest."""

    def __init__(
        self,
        row_number: int,
        email: str,
        first_name: str,
        last_name: str,
        reason: str
    ):
        self.row_number = row_number
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.reason = reason

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            'row_number': self.row_number,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'reason': self.reason
        }


class ImportError:
    """Details about an import error."""

    def __init__(self, row_number: int, errors: List[str], data: Dict):
        self.row_number = row_number
        self.errors = errors
        self.data = data

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            'row_number': self.row_number,
            'errors': self.errors,
            'data': self.data
        }


class CSVImportPreviewResult:
    """Result of CSV import preview."""

    def __init__(
        self,
        total_rows: int,
        valid_rows: int,
        duplicate_rows: int,
        error_rows: int,
        duplicates: List[DuplicateDetail],
        errors: List[ImportError],
        sample_guests: List[Dict],
        column_mapping: Dict[str, str]
    ):
        self.total_rows = total_rows
        self.valid_rows = valid_rows
        self.duplicate_rows = duplicate_rows
        self.error_rows = error_rows
        self.duplicates = duplicates
        self.errors = errors
        self.sample_guests = sample_guests
        self.column_mapping = column_mapping

    def to_dict(self) -> Dict:
        """Convert to dictionary for API response."""
        return {
            'total_rows': self.total_rows,
            'valid_rows': self.valid_rows,
            'duplicate_rows': self.duplicate_rows,
            'error_rows': self.error_rows,
            'duplicates': [d.to_dict() for d in self.duplicates],
            'errors': [e.to_dict() for e in self.errors],
            'sample_guests': self.sample_guests,
            'column_mapping': self.column_mapping
        }


class CSVImportExecuteResult:
    """Result of CSV import execution."""

    def __init__(
        self,
        success_count: int,
        error_count: int,
        skipped_count: int,
        created_guest_ids: List[UUID],
        errors: List[str]
    ):
        self.success_count = success_count
        self.error_count = error_count
        self.skipped_count = skipped_count
        self.created_guest_ids = created_guest_ids
        self.errors = errors

    def to_dict(self) -> Dict:
        """Convert to dictionary for API response."""
        return {
            'success_count': self.success_count,
            'error_count': self.error_count,
            'skipped_count': self.skipped_count,
            'created_guest_ids': [str(gid) for gid in self.created_guest_ids],
            'errors': self.errors
        }


class CSVImportService:
    """Service for importing guests from CSV files."""

    @staticmethod
    async def get_existing_emails(db: AsyncSession, event_id: UUID) -> Set[str]:
        """
        Get set of existing guest emails for an event.

        Args:
            db: Database session
            event_id: Event UUID

        Returns:
            Set of lowercase email addresses
        """
        guests = await crud_guest.get_guests_by_event(db, event_id, skip=0, limit=10000)
        return {guest.email.lower() for guest in guests if guest.email}

    @staticmethod
    async def preview_import(
        db: AsyncSession,
        event_id: UUID,
        file_content: bytes,
        encoding: Optional[str] = None
    ) -> CSVImportPreviewResult:
        """
        Preview CSV import without actually importing.

        Args:
            db: Database session
            event_id: Event UUID
            file_content: Raw CSV file bytes
            encoding: Character encoding (auto-detected if None)

        Returns:
            CSVImportPreviewResult with statistics and details
        """
        # Parse CSV
        df, column_mapping, parse_errors = CSVParser.parse_csv(file_content, encoding)

        # If parsing failed, return early
        if parse_errors or df.empty:
            return CSVImportPreviewResult(
                total_rows=0,
                valid_rows=0,
                duplicate_rows=0,
                error_rows=0,
                duplicates=[],
                errors=[
                    ImportError(row_number=0, errors=parse_errors, data={})
                ] if parse_errors else [],
                sample_guests=[],
                column_mapping=column_mapping
            )

        # Get existing emails from database
        existing_emails = await CSVImportService.get_existing_emails(db, event_id)

        # Process each row
        total_rows = len(df)
        valid_guests = []
        duplicate_details = []
        error_details = []
        guests_with_row_numbers = []

        for row_idx in range(total_rows):
            row_number = row_idx + 2  # +2 because: 0-indexed + header row

            # Extract guest data
            guest_data = CSVParser.extract_guest_data(df, column_mapping, row_idx)
            guest_data['row_number'] = row_number
            guests_with_row_numbers.append(guest_data)

            # Validate guest data
            validation_errors = CSVParser.validate_guest_data(guest_data, row_number)

            if validation_errors:
                error_details.append(
                    ImportError(
                        row_number=row_number,
                        errors=validation_errors,
                        data={
                            'email': guest_data.get('email', ''),
                            'first_name': guest_data.get('first_name', ''),
                            'last_name': guest_data.get('last_name', '')
                        }
                    )
                )
                continue

            valid_guests.append(guest_data)

        # Find duplicates among valid guests
        unique_guests, duplicates = CSVParser.find_duplicates(valid_guests, existing_emails)

        # Create duplicate details
        for duplicate in duplicates:
            duplicate_details.append(
                DuplicateDetail(
                    row_number=duplicate['row_number'],
                    email=duplicate.get('email', ''),
                    first_name=duplicate.get('first_name', ''),
                    last_name=duplicate.get('last_name', ''),
                    reason=duplicate.get('duplicate_reason', 'unknown')
                )
            )

        # Get sample of first 10 unique guests for preview
        sample_guests = [
            {
                'email': g.get('email', ''),
                'first_name': g.get('first_name', ''),
                'last_name': g.get('last_name', ''),
                'phone': g.get('phone'),
                'plus_one_allowed': g.get('plus_one_allowed', False),
                'dietary_restrictions': g.get('dietary_restrictions')
            }
            for g in unique_guests[:10]
        ]

        return CSVImportPreviewResult(
            total_rows=total_rows,
            valid_rows=len(unique_guests),
            duplicate_rows=len(duplicates),
            error_rows=len(error_details),
            duplicates=duplicate_details,
            errors=error_details,
            sample_guests=sample_guests,
            column_mapping=column_mapping
        )

    @staticmethod
    async def execute_import(
        db: AsyncSession,
        event_id: UUID,
        file_content: bytes,
        skip_duplicates: bool = True,
        encoding: Optional[str] = None
    ) -> CSVImportExecuteResult:
        """
        Execute CSV import and create guests in database.

        Args:
            db: Database session
            event_id: Event UUID
            file_content: Raw CSV file bytes
            skip_duplicates: Whether to skip duplicate emails
            encoding: Character encoding (auto-detected if None)

        Returns:
            CSVImportExecuteResult with import statistics
        """
        # Parse CSV
        df, column_mapping, parse_errors = CSVParser.parse_csv(file_content, encoding)

        # If parsing failed, return early
        if parse_errors or df.empty:
            return CSVImportExecuteResult(
                success_count=0,
                error_count=len(parse_errors) if parse_errors else 1,
                skipped_count=0,
                created_guest_ids=[],
                errors=parse_errors if parse_errors else ['Failed to parse CSV file']
            )

        # Get existing emails
        existing_emails = await CSVImportService.get_existing_emails(db, event_id)

        # Process rows and collect valid guests
        total_rows = len(df)
        valid_guests = []
        execution_errors = []

        for row_idx in range(total_rows):
            row_number = row_idx + 2  # +2 for 0-indexed + header row

            try:
                # Extract and validate guest data
                guest_data = CSVParser.extract_guest_data(df, column_mapping, row_idx)
                validation_errors = CSVParser.validate_guest_data(guest_data, row_number)

                if validation_errors:
                    execution_errors.extend(validation_errors)
                    continue

                valid_guests.append(guest_data)

            except Exception as e:
                execution_errors.append(f"Row {row_number}: Unexpected error - {str(e)}")

        # Find duplicates and get unique guests
        unique_guests, duplicates = CSVParser.find_duplicates(valid_guests, existing_emails)

        # Create GuestCreate objects for unique guests
        guests_to_create = []
        for guest_data in unique_guests:
            try:
                guest_create = GuestCreate(
                    email=guest_data['email'],
                    first_name=guest_data['first_name'],
                    last_name=guest_data['last_name'],
                    phone=guest_data.get('phone'),
                    plus_one_allowed=guest_data.get('plus_one_allowed', False),
                    plus_one_name=guest_data.get('plus_one_name'),
                    dietary_restrictions=guest_data.get('dietary_restrictions'),
                    notes=guest_data.get('notes')
                )
                guests_to_create.append(guest_create)
            except Exception as e:
                execution_errors.append(
                    f"Failed to create guest object for {guest_data.get('email', 'unknown')}: {str(e)}"
                )

        # Bulk create guests in database
        created_guest_ids = []
        creation_error_count = 0

        if guests_to_create:
            try:
                print(f"[CSV Import] Attempting to create {len(guests_to_create)} guests for event {event_id}")
                created_guests = await crud_guest.create_guests_bulk(
                    db,
                    guests_to_create,
                    event_id
                )
                print(f"[CSV Import] Successfully created {len(created_guests)} guest objects")

                await db.commit()
                print(f"[CSV Import] Database commit successful")

                created_guest_ids = [guest.id for guest in created_guests]
                print(f"[CSV Import] Created guest IDs: {[str(gid) for gid in created_guest_ids]}")

            except Exception as e:
                print(f"[CSV Import ERROR] Exception during bulk creation: {type(e).__name__}: {str(e)}")
                import traceback
                print(f"[CSV Import ERROR] Traceback: {traceback.format_exc()}")
                await db.rollback()
                execution_errors.append(f"Database error during bulk creation: {type(e).__name__}: {str(e)}")
                creation_error_count = len(guests_to_create)

        return CSVImportExecuteResult(
            success_count=len(created_guest_ids),
            error_count=len(execution_errors) + creation_error_count,
            skipped_count=len(duplicates) if skip_duplicates else 0,
            created_guest_ids=created_guest_ids,
            errors=execution_errors
        )


# Create singleton instance
csv_import_service = CSVImportService()
