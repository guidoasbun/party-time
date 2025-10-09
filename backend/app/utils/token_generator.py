"""Token generation utilities for RSVP tokens."""
import secrets
import string
from typing import Optional


# Constants for token generation
TOKEN_LENGTH = 8
TOKEN_ALPHABET = string.ascii_uppercase + string.digits  # A-Z, 0-9
MAX_COLLISION_RETRIES = 10


def generate_rsvp_token(length: int = TOKEN_LENGTH) -> str:
    """
    Generate a secure, user-friendly RSVP token.

    Args:
        length: Length of the token (default: 8)

    Returns:
        A random alphanumeric token in uppercase (e.g., "A3X7K9M2")

    Example:
        >>> token = generate_rsvp_token()
        >>> len(token)
        8
        >>> token.isalnum() and token.isupper()
        True
    """
    return ''.join(secrets.choice(TOKEN_ALPHABET) for _ in range(length))


def generate_unique_token(
    length: int = TOKEN_LENGTH,
    validator: Optional[callable] = None,
    max_retries: int = MAX_COLLISION_RETRIES
) -> str:
    """
    Generate a unique token with collision detection.

    Args:
        length: Length of the token
        validator: Optional async function that checks if token already exists
                  Should return True if token is unique, False if collision
        max_retries: Maximum number of generation attempts

    Returns:
        A unique token

    Raises:
        RuntimeError: If unable to generate unique token after max_retries

    Example:
        >>> async def check_unique(token: str) -> bool:
        ...     return token not in existing_tokens
        >>> token = generate_unique_token(validator=check_unique)
    """
    for attempt in range(max_retries):
        token = generate_rsvp_token(length)

        # If no validator provided, assume token is unique
        if validator is None:
            return token

        # Check uniqueness
        try:
            is_unique = validator(token)
            if is_unique:
                return token
        except Exception as e:
            # If validation fails, try again
            if attempt == max_retries - 1:
                raise RuntimeError(
                    f"Failed to validate token uniqueness: {str(e)}"
                ) from e
            continue

    raise RuntimeError(
        f"Failed to generate unique token after {max_retries} attempts"
    )


def validate_token_format(token: str) -> bool:
    """
    Validate that a token matches the expected format.

    Args:
        token: Token string to validate

    Returns:
        True if token is valid format, False otherwise

    Example:
        >>> validate_token_format("A3X7K9M2")
        True
        >>> validate_token_format("invalid-token")
        False
        >>> validate_token_format("a3x7k9m2")  # lowercase
        False
    """
    if not token:
        return False

    if len(token) != TOKEN_LENGTH:
        return False

    # Check if all characters are in valid alphabet
    return all(char in TOKEN_ALPHABET for char in token)


def format_token_for_display(token: str, separator: str = "-") -> str:
    """
    Format token for display with optional separator.

    Args:
        token: Token string to format
        separator: Separator character (default: "-")

    Returns:
        Formatted token string

    Example:
        >>> format_token_for_display("A3X7K9M2")
        'A3X7-K9M2'
        >>> format_token_for_display("A3X7K9M2", separator=" ")
        'A3X7 K9M2'
    """
    if len(token) != TOKEN_LENGTH:
        return token

    # Split into two groups of 4
    return f"{token[:4]}{separator}{token[4:]}"


def generate_token_batch(count: int, length: int = TOKEN_LENGTH) -> list[str]:
    """
    Generate a batch of tokens (useful for testing).

    Args:
        count: Number of tokens to generate
        length: Length of each token

    Returns:
        List of unique tokens

    Example:
        >>> tokens = generate_token_batch(5)
        >>> len(tokens)
        5
        >>> len(set(tokens)) == 5  # All unique
        True
    """
    tokens = set()
    max_attempts = count * 10  # Prevent infinite loop
    attempts = 0

    while len(tokens) < count and attempts < max_attempts:
        token = generate_rsvp_token(length)
        tokens.add(token)
        attempts += 1

    if len(tokens) < count:
        raise RuntimeError(
            f"Could only generate {len(tokens)} unique tokens out of {count} requested"
        )

    return list(tokens)


def estimate_collision_probability(
    tokens_generated: int,
    length: int = TOKEN_LENGTH
) -> float:
    """
    Estimate probability of token collision (birthday problem).

    Args:
        tokens_generated: Number of tokens that will be generated
        length: Token length

    Returns:
        Approximate collision probability (0.0 to 1.0)

    Note:
        With 8 characters and 36 possible values (A-Z, 0-9):
        - Total possibilities: 36^8 = 2,821,109,907,456 (2.8 trillion)
        - After 1 million tokens: collision probability < 0.0001%
    """
    alphabet_size = len(TOKEN_ALPHABET)
    total_possibilities = alphabet_size ** length

    # Using birthday problem approximation: P(collision) ≈ 1 - e^(-n²/(2*m))
    # where n = tokens generated, m = total possibilities
    import math

    exponent = -(tokens_generated ** 2) / (2 * total_possibilities)
    collision_prob = 1 - math.exp(exponent)

    return collision_prob
