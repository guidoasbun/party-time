"""Smoke tests for CSV import functionality."""
import pytest
from pathlib import Path
from app.utils.csv_parser import CSVParser


class TestCSVParser:
    """Test CSV parser utility."""

    @pytest.fixture
    def sample_csv_content(self):
        """Load sample CSV file content."""
        csv_path = Path(__file__).parent / "fixtures" / "sample_guests.csv"
        with open(csv_path, 'rb') as f:
            return f.read()

    def test_csv_parsing(self, sample_csv_content):
        """Test CSV parsing with sample file."""
        df, column_mapping, errors = CSVParser.parse_csv(sample_csv_content)

        # Should parse successfully
        assert len(errors) == 0, f"Parsing errors: {errors}"
        assert not df.empty, "DataFrame should not be empty"

        # Should detect required columns
        assert 'email' in column_mapping, "Email column should be detected"
        assert 'first_name' in column_mapping, "First name column should be detected"
        assert 'last_name' in column_mapping, "Last name column should be detected"

        # Should have 10 rows (excluding header)
        assert len(df) == 10, f"Expected 10 rows, got {len(df)}"

        print(f"✓ Parsed CSV successfully: {len(df)} rows")
        print(f"✓ Detected columns: {list(column_mapping.keys())}")

    def test_column_detection(self):
        """Test smart column name detection."""
        # Test various column name formats
        test_cases = [
            ("Email", "email"),
            ("first name", "first_name"),
            ("First Name", "first_name"),
            ("LAST NAME", "last_name"),
            ("Phone Number", "phone"),
            ("Plus One", "plus_one_allowed"),
            ("Dietary Restrictions", "dietary_restrictions")
        ]

        for input_col, expected_field in test_cases:
            result = CSVParser.normalize_column_name(input_col)
            assert result == expected_field, \
                f"Failed to normalize '{input_col}' to '{expected_field}', got '{result}'"

        print(f"✓ Column detection working for {len(test_cases)} variations")

    def test_email_validation(self):
        """Test email validation."""
        valid_emails = [
            "john@example.com",
            "jane.smith@company.co.uk",
            "user+tag@domain.com"
        ]
        invalid_emails = [
            "invalid",
            "@domain.com",
            "user@",
            ""
        ]

        for email in valid_emails:
            assert CSVParser.validate_email_format(email), \
                f"Email '{email}' should be valid"

        for email in invalid_emails:
            assert not CSVParser.validate_email_format(email), \
                f"Email '{email}' should be invalid"

        print(f"✓ Email validation working correctly")

    def test_boolean_parsing(self):
        """Test boolean value parsing."""
        true_values = ["true", "True", "TRUE", "yes", "Yes", "y", "1", "x"]
        false_values = ["false", "False", "no", "No", "n", "0", "", None]

        for value in true_values:
            assert CSVParser.parse_boolean(value), \
                f"Value '{value}' should parse to True"

        for value in false_values:
            assert not CSVParser.parse_boolean(value), \
                f"Value '{value}' should parse to False"

        print(f"✓ Boolean parsing working correctly")

    def test_data_extraction(self, sample_csv_content):
        """Test guest data extraction from CSV."""
        df, column_mapping, _ = CSVParser.parse_csv(sample_csv_content)

        # Extract first guest
        guest_data = CSVParser.extract_guest_data(df, column_mapping, 0)

        # Verify required fields
        assert 'email' in guest_data, "Email should be extracted"
        assert 'first_name' in guest_data, "First name should be extracted"
        assert 'last_name' in guest_data, "Last name should be extracted"

        # Verify data types
        assert isinstance(guest_data.get('plus_one_allowed'), bool), \
            "Plus one allowed should be boolean"

        # Verify expected values from first row
        assert guest_data['email'] == 'john.doe@example.com'
        assert guest_data['first_name'] == 'John'
        assert guest_data['last_name'] == 'Doe'

        print(f"✓ Data extraction working correctly")
        print(f"  Sample guest: {guest_data['first_name']} {guest_data['last_name']}")

    def test_duplicate_detection(self):
        """Test duplicate detection logic."""
        guests_data = [
            {'email': 'john@example.com', 'first_name': 'John', 'last_name': 'Doe'},
            {'email': 'jane@example.com', 'first_name': 'Jane', 'last_name': 'Smith'},
            {'email': 'john@example.com', 'first_name': 'John', 'last_name': 'Doe'},  # Duplicate
        ]

        existing_emails = {'bob@example.com'}  # Already in database

        unique, duplicates = CSVParser.find_duplicates(guests_data, existing_emails)

        # Should have 2 unique guests and 1 duplicate
        assert len(unique) == 2, f"Expected 2 unique guests, got {len(unique)}"
        assert len(duplicates) == 1, f"Expected 1 duplicate, got {len(duplicates)}"

        # Verify duplicate reason
        assert duplicates[0]['duplicate_reason'] == 'duplicate_in_file'

        print(f"✓ Duplicate detection working correctly")
        print(f"  Unique: {len(unique)}, Duplicates: {len(duplicates)}")


def test_sample_csv_file_exists():
    """Test that sample CSV file exists and is readable."""
    csv_path = Path(__file__).parent / "fixtures" / "sample_guests.csv"
    assert csv_path.exists(), f"Sample CSV file not found at {csv_path}"

    # Read and verify basic structure
    with open(csv_path, 'r') as f:
        lines = f.readlines()
        assert len(lines) > 1, "CSV file should have header + data rows"
        assert 'Email' in lines[0], "Header should contain 'Email' column"

    print(f"✓ Sample CSV file exists and is readable")
    print(f"  Path: {csv_path}")
    print(f"  Rows: {len(lines)} (including header)")


if __name__ == '__main__':
    print("\n=== CSV Import Smoke Tests ===\n")
    pytest.main([__file__, '-v', '-s'])
