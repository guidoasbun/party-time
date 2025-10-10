"""CSV parsing utilities for guest import."""
import io
import csv
from typing import List, Dict, Optional, Tuple, Set
import pandas as pd
import chardet
from email_validator import validate_email, EmailNotValidError


class CSVParser:
    """Parser for CSV files with smart column detection and data normalization."""

    # Column name mappings for flexible parsing
    COLUMN_MAPPINGS = {
        'email': ['email', 'e-mail', 'email address', 'e_mail', 'emailaddress'],
        'first_name': ['first name', 'first_name', 'firstname', 'fname', 'given name', 'given_name'],
        'last_name': ['last name', 'last_name', 'lastname', 'lname', 'surname', 'family name', 'family_name'],
        'phone': ['phone', 'phone number', 'phone_number', 'phonenumber', 'mobile', 'cell', 'telephone'],
        'plus_one_allowed': ['plus one', 'plus_one', 'plusone', 'plus one allowed', 'plus_one_allowed', '+1', 'bring guest'],
        'plus_one_name': ['plus one name', 'plus_one_name', 'plusonename', 'guest name', 'guest_name'],
        'dietary_restrictions': ['dietary restrictions', 'dietary_restrictions', 'dietary', 'diet', 'allergies', 'food preferences'],
        'notes': ['notes', 'note', 'comments', 'comment', 'special requests', 'special_requests']
    }

    @staticmethod
    def detect_encoding(file_content: bytes) -> str:
        """Detect the character encoding of a file."""
        result = chardet.detect(file_content)
        return result['encoding'] or 'utf-8'

    @staticmethod
    def detect_delimiter(content: str, sample_lines: int = 5) -> str:
        """Detect CSV delimiter from content."""
        lines = content.split('\n')[:sample_lines]
        sample = '\n'.join(lines)

        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=',;\t|')
            return dialect.delimiter
        except csv.Error:
            # Default to comma if detection fails
            return ','

    @staticmethod
    def normalize_column_name(column: str) -> Optional[str]:
        """
        Normalize column names to match expected field names.

        Args:
            column: Raw column name from CSV

        Returns:
            Normalized field name or None if not recognized
        """
        normalized = column.lower().strip()

        for field_name, variations in CSVParser.COLUMN_MAPPINGS.items():
            if normalized in variations:
                return field_name

        return None

    @staticmethod
    def detect_columns(headers: List[str]) -> Dict[str, Optional[str]]:
        """
        Detect and map CSV columns to guest fields.

        Args:
            headers: List of column headers from CSV

        Returns:
            Dictionary mapping field names to CSV column names
        """
        column_mapping = {}

        for header in headers:
            field_name = CSVParser.normalize_column_name(header)
            if field_name:
                column_mapping[field_name] = header

        return column_mapping

    @staticmethod
    def validate_email_format(email: str) -> bool:
        """Validate email format."""
        if not email or not isinstance(email, str):
            return False

        try:
            validate_email(email, check_deliverability=False)
            return True
        except EmailNotValidError:
            return False

    @staticmethod
    def sanitize_phone(phone: Optional[str]) -> Optional[str]:
        """Sanitize phone number by removing non-digit characters."""
        if not phone or pd.isna(phone):
            return None

        # Keep only digits, +, (, ), -, and spaces
        phone_str = str(phone).strip()
        if not phone_str:
            return None

        # Remove extra whitespace
        phone_str = ' '.join(phone_str.split())

        return phone_str if phone_str else None

    @staticmethod
    def parse_boolean(value: Optional[str]) -> bool:
        """Parse boolean value from string."""
        if pd.isna(value) or value is None:
            return False

        value_str = str(value).lower().strip()
        return value_str in ['true', 't', 'yes', 'y', '1', 'x', 'checked']

    @staticmethod
    def sanitize_text(text: Optional[str], max_length: Optional[int] = None) -> Optional[str]:
        """Sanitize text field."""
        if pd.isna(text) or text is None:
            return None

        text_str = str(text).strip()
        if not text_str:
            return None

        if max_length and len(text_str) > max_length:
            text_str = text_str[:max_length]

        return text_str

    @classmethod
    def parse_csv(
        cls,
        file_content: bytes,
        encoding: Optional[str] = None
    ) -> Tuple[pd.DataFrame, Dict[str, str], List[str]]:
        """
        Parse CSV content into a pandas DataFrame with smart column detection.

        Args:
            file_content: Raw file bytes
            encoding: Character encoding (auto-detected if None)

        Returns:
            Tuple of (DataFrame, column_mapping, errors)
        """
        errors = []

        # Detect encoding if not provided
        if not encoding:
            encoding = cls.detect_encoding(file_content)

        try:
            # Decode content
            content = file_content.decode(encoding)
        except UnicodeDecodeError as e:
            errors.append(f"Failed to decode file with {encoding} encoding: {str(e)}")
            # Try UTF-8 as fallback
            try:
                content = file_content.decode('utf-8')
            except UnicodeDecodeError:
                content = file_content.decode('latin-1')  # Final fallback

        # Detect delimiter
        delimiter = cls.detect_delimiter(content)

        # Parse CSV with pandas
        try:
            df = pd.read_csv(
                io.StringIO(content),
                delimiter=delimiter,
                skipinitialspace=True,
                na_values=['', 'NA', 'N/A', 'null', 'NULL', 'None'],
                keep_default_na=True
            )
        except Exception as e:
            errors.append(f"Failed to parse CSV: {str(e)}")
            return pd.DataFrame(), {}, errors

        # Detect column mappings
        column_mapping = cls.detect_columns(df.columns.tolist())

        # Check for required columns
        required_fields = ['email', 'first_name', 'last_name']
        missing_fields = [field for field in required_fields if field not in column_mapping]

        if missing_fields:
            errors.append(
                f"Missing required columns: {', '.join(missing_fields)}. "
                f"Available columns: {', '.join(df.columns.tolist())}"
            )

        return df, column_mapping, errors

    @classmethod
    def extract_guest_data(
        cls,
        df: pd.DataFrame,
        column_mapping: Dict[str, str],
        row_index: int
    ) -> Dict[str, any]:
        """
        Extract and sanitize guest data from a DataFrame row.

        Args:
            df: Pandas DataFrame
            column_mapping: Mapping of field names to CSV columns
            row_index: Row index in DataFrame

        Returns:
            Dictionary with sanitized guest data
        """
        row = df.iloc[row_index]
        guest_data = {}

        # Extract and sanitize each field
        for field, csv_column in column_mapping.items():
            value = row.get(csv_column)

            if field == 'email':
                guest_data['email'] = cls.sanitize_text(value, max_length=255)
            elif field == 'first_name':
                guest_data['first_name'] = cls.sanitize_text(value, max_length=100)
            elif field == 'last_name':
                guest_data['last_name'] = cls.sanitize_text(value, max_length=100)
            elif field == 'phone':
                guest_data['phone'] = cls.sanitize_phone(value)
            elif field == 'plus_one_allowed':
                guest_data['plus_one_allowed'] = cls.parse_boolean(value)
            elif field == 'plus_one_name':
                guest_data['plus_one_name'] = cls.sanitize_text(value, max_length=200)
            elif field == 'dietary_restrictions':
                guest_data['dietary_restrictions'] = cls.sanitize_text(value)
            elif field == 'notes':
                guest_data['notes'] = cls.sanitize_text(value)

        # Set defaults for missing optional fields
        if 'plus_one_allowed' not in guest_data:
            guest_data['plus_one_allowed'] = False

        return guest_data

    @classmethod
    def validate_guest_data(cls, guest_data: Dict[str, any], row_number: int) -> List[str]:
        """
        Validate guest data and return list of validation errors.

        Args:
            guest_data: Dictionary with guest data
            row_number: Row number in CSV (1-indexed)

        Returns:
            List of validation error messages
        """
        errors = []

        # Required fields
        if not guest_data.get('email'):
            errors.append(f"Row {row_number}: Email is required")
        elif not cls.validate_email_format(guest_data['email']):
            errors.append(f"Row {row_number}: Invalid email format '{guest_data['email']}'")

        if not guest_data.get('first_name'):
            errors.append(f"Row {row_number}: First name is required")

        if not guest_data.get('last_name'):
            errors.append(f"Row {row_number}: Last name is required")

        # Length validations
        if guest_data.get('first_name') and len(guest_data['first_name']) > 100:
            errors.append(f"Row {row_number}: First name exceeds 100 characters")

        if guest_data.get('last_name') and len(guest_data['last_name']) > 100:
            errors.append(f"Row {row_number}: Last name exceeds 100 characters")

        if guest_data.get('plus_one_name') and len(guest_data['plus_one_name']) > 200:
            errors.append(f"Row {row_number}: Plus one name exceeds 200 characters")

        return errors

    @classmethod
    def find_duplicates(
        cls,
        guests_data: List[Dict[str, any]],
        existing_emails: Set[str]
    ) -> Tuple[List[Dict[str, any]], List[Dict[str, any]]]:
        """
        Find duplicate guests based on email.

        Args:
            guests_data: List of guest data dictionaries
            existing_emails: Set of emails already in database

        Returns:
            Tuple of (unique_guests, duplicates)
        """
        unique_guests = []
        duplicates = []
        seen_emails = set()

        for guest_data in guests_data:
            email = guest_data.get('email', '').lower()

            if not email:
                continue

            # Check if email already exists in database
            if email in existing_emails:
                guest_data['duplicate_reason'] = 'exists_in_database'
                duplicates.append(guest_data)
                continue

            # Check if email already seen in this file
            if email in seen_emails:
                guest_data['duplicate_reason'] = 'duplicate_in_file'
                duplicates.append(guest_data)
                continue

            seen_emails.add(email)
            unique_guests.append(guest_data)

        return unique_guests, duplicates
