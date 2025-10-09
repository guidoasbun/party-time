"""QR code generation utilities for RSVP invitations."""
import base64
import io
from enum import Enum
from typing import Optional

try:
    import qrcode
    from qrcode.image.pure import PyPNGImage
    QR_AVAILABLE = True
except ImportError:
    QR_AVAILABLE = False
    PyPNGImage = None


class QRFormat(str, Enum):
    """Supported QR code output formats."""
    PNG = "png"
    SVG = "svg"


class QRErrorCorrection(str, Enum):
    """QR code error correction levels."""
    LOW = "L"      # ~7% error correction
    MEDIUM = "M"   # ~15% error correction
    QUARTILE = "Q" # ~25% error correction
    HIGH = "H"     # ~30% error correction


# QR code size limits for safety
MIN_BOX_SIZE = 5
MAX_BOX_SIZE = 50
MIN_BORDER = 1
MAX_BORDER = 10


def is_qr_available() -> bool:
    """Check if QR code generation is available."""
    return QR_AVAILABLE


def generate_qr_code(
    data: str,
    box_size: int = 10,
    border: int = 4,
    error_correction: QRErrorCorrection = QRErrorCorrection.MEDIUM,
    format: QRFormat = QRFormat.PNG,
    fill_color: str = "black",
    back_color: str = "white"
) -> bytes:
    """
    Generate a QR code image.

    Args:
        data: Data to encode (usually a URL)
        box_size: Size of each box in pixels (5-50)
        border: Border size in boxes (1-10)
        error_correction: Error correction level
        format: Output format (PNG or SVG)
        fill_color: Foreground color (default: black)
        back_color: Background color (default: white)

    Returns:
        QR code image as bytes

    Raises:
        ImportError: If qrcode library is not installed
        ValueError: If parameters are out of valid range

    Example:
        >>> url = "https://example.com/rsvp/A3X7K9M2"
        >>> qr_bytes = generate_qr_code(url)
        >>> len(qr_bytes) > 0
        True
    """
    if not QR_AVAILABLE:
        raise ImportError(
            "qrcode library not installed. "
            "Install with: pip install qrcode[pil]"
        )

    # Validate parameters
    if box_size < MIN_BOX_SIZE or box_size > MAX_BOX_SIZE:
        raise ValueError(
            f"box_size must be between {MIN_BOX_SIZE} and {MAX_BOX_SIZE}"
        )

    if border < MIN_BORDER or border > MAX_BORDER:
        raise ValueError(
            f"border must be between {MIN_BORDER} and {MAX_BORDER}"
        )

    # Map error correction level to qrcode constants
    error_correction_map = {
        QRErrorCorrection.LOW: qrcode.constants.ERROR_CORRECT_L,
        QRErrorCorrection.MEDIUM: qrcode.constants.ERROR_CORRECT_M,
        QRErrorCorrection.QUARTILE: qrcode.constants.ERROR_CORRECT_Q,
        QRErrorCorrection.HIGH: qrcode.constants.ERROR_CORRECT_H,
    }

    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,  # Auto-adjust version based on data length
        error_correction=error_correction_map[error_correction],
        box_size=box_size,
        border=border,
    )

    # Add data and generate
    qr.add_data(data)
    qr.make(fit=True)

    # Generate image based on format
    if format == QRFormat.SVG:
        # SVG format
        from qrcode.image.svg import SvgPathImage
        img = qr.make_image(
            image_factory=SvgPathImage,
            fill_color=fill_color,
            back_color=back_color
        )

        # Convert SVG to bytes
        buffer = io.BytesIO()
        img.save(buffer)
        return buffer.getvalue()
    else:
        # PNG format (default)
        img = qr.make_image(
            fill_color=fill_color,
            back_color=back_color
        )

        # Convert PIL image to bytes
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        return buffer.getvalue()


def generate_qr_code_base64(
    data: str,
    box_size: int = 10,
    border: int = 4,
    error_correction: QRErrorCorrection = QRErrorCorrection.MEDIUM,
    fill_color: str = "black",
    back_color: str = "white"
) -> str:
    """
    Generate a QR code and return as base64-encoded string.

    Args:
        data: Data to encode
        box_size: Size of each box in pixels
        border: Border size in boxes
        error_correction: Error correction level
        fill_color: Foreground color
        back_color: Background color

    Returns:
        Base64-encoded PNG image with data URI prefix

    Example:
        >>> url = "https://example.com/rsvp/A3X7K9M2"
        >>> base64_data = generate_qr_code_base64(url)
        >>> base64_data.startswith("data:image/png;base64,")
        True
    """
    qr_bytes = generate_qr_code(
        data=data,
        box_size=box_size,
        border=border,
        error_correction=error_correction,
        format=QRFormat.PNG,
        fill_color=fill_color,
        back_color=back_color
    )

    # Encode to base64
    base64_encoded = base64.b64encode(qr_bytes).decode('utf-8')

    # Return as data URI
    return f"data:image/png;base64,{base64_encoded}"


def generate_rsvp_qr_code(
    rsvp_url: str,
    box_size: int = 10,
    border: int = 4,
    theme: str = "light"
) -> bytes:
    """
    Generate a themed QR code for RSVP invitation.

    Args:
        rsvp_url: Full RSVP URL to encode
        box_size: Size of each box in pixels
        border: Border size in boxes
        theme: Color theme ('light' or 'dark')

    Returns:
        QR code image as bytes

    Example:
        >>> url = "https://party-time.com/rsvp/A3X7K9M2"
        >>> qr_bytes = generate_rsvp_qr_code(url, theme='dark')
        >>> len(qr_bytes) > 0
        True
    """
    # Set colors based on theme
    if theme == "dark":
        fill_color = "white"
        back_color = "#1a1a1a"  # Dark background
    else:
        fill_color = "black"
        back_color = "white"

    return generate_qr_code(
        data=rsvp_url,
        box_size=box_size,
        border=border,
        error_correction=QRErrorCorrection.HIGH,  # Higher error correction for invitations
        format=QRFormat.PNG,
        fill_color=fill_color,
        back_color=back_color
    )


def estimate_qr_size(
    data_length: int,
    box_size: int = 10,
    border: int = 4
) -> tuple[int, int]:
    """
    Estimate the dimensions of a QR code image.

    Args:
        data_length: Length of data to encode
        box_size: Size of each box in pixels
        border: Border size in boxes

    Returns:
        Tuple of (width, height) in pixels

    Note:
        This is an approximation. Actual size depends on QR version.
        - Version 1: 21x21 modules (up to 25 chars)
        - Version 2: 25x25 modules (up to 47 chars)
        - Version 3: 29x29 modules (up to 77 chars)
        - etc.
    """
    # Estimate QR version based on data length
    # This is a rough approximation
    if data_length <= 25:
        modules = 21  # Version 1
    elif data_length <= 47:
        modules = 25  # Version 2
    elif data_length <= 77:
        modules = 29  # Version 3
    elif data_length <= 114:
        modules = 33  # Version 4
    elif data_length <= 154:
        modules = 37  # Version 5
    else:
        # For longer data, estimate based on growth pattern
        modules = 21 + (data_length // 30) * 4

    # Calculate pixel dimensions
    # Size = (modules + border*2) * box_size
    pixel_size = (modules + border * 2) * box_size

    return (pixel_size, pixel_size)


def get_qr_recommendations(url_length: int) -> dict[str, int | str]:
    """
    Get recommended QR code settings based on use case.

    Args:
        url_length: Length of the URL to encode

    Returns:
        Dictionary with recommended settings

    Example:
        >>> settings = get_qr_recommendations(50)
        >>> settings['box_size']
        10
        >>> settings['use_case']
        'print'
    """
    # Determine use case based on URL length
    if url_length <= 50:
        # Short URLs - optimal for all use cases
        return {
            "box_size": 10,
            "border": 4,
            "error_correction": QRErrorCorrection.HIGH,
            "use_case": "all",
            "estimated_size": "300x300px"
        }
    elif url_length <= 100:
        # Medium URLs - good for print and digital
        return {
            "box_size": 8,
            "border": 3,
            "error_correction": QRErrorCorrection.MEDIUM,
            "use_case": "print",
            "estimated_size": "250x250px"
        }
    else:
        # Long URLs - optimized for digital only
        return {
            "box_size": 6,
            "border": 2,
            "error_correction": QRErrorCorrection.LOW,
            "use_case": "digital",
            "estimated_size": "200x200px"
        }
