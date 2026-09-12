import re
import ipaddress


def is_valid_ip(ip_str: str) -> bool:
    """Validates IPv4 or IPv6."""
    try:
        ipaddress.ip_address(str(ip_str).strip())
        return True
    except ValueError:
        return False


def is_valid_phone(phone_str: str) -> bool:
    """Detects if a string is a plausible phone number."""
    cleaned = re.sub(r'[\s\-\+\(\)]', '', str(phone_str))
    return cleaned.isdigit() and len(cleaned) in (10, 11, 12, 13)


def is_valid_mac(mac_str: str) -> bool:
    """Checks for standard MAC address (e.g., 00:1A:2B:3C:4D:5E or 00-1A-2B-3C-4D-5E)."""
    clean = str(mac_str).strip()
    return bool(re.match(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$', clean))


def is_valid_imei(imei_str: str) -> bool:
    """Checks for 14-16 digit IMEI number."""
    clean = re.sub(r'\D', '', str(imei_str))
    return len(clean) in (14, 15, 16)


def is_valid_upi(upi_str: str) -> bool:
    """Checks for valid VPA/UPI pattern (e.g. user@bank or phone@upi)."""
    clean = str(upi_str).strip()
    return bool(re.match(r'^[\w\.\-]+@[\w\-]+$', clean))
