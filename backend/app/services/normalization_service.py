import re
import ipaddress
from typing import Tuple


class NormalizationService:
    """
    Forensic normalization service that preserves both original raw artifact values
    and generates standardized canonical normalized values for cross-correlation.
    """

    @staticmethod
    def normalize_phone(raw_phone: str) -> Tuple[str, str]:
        """
        Normalizes phone numbers.
        Returns: (original_value, normalized_value)
        e.g. "+91 98440-12901" -> ("+91 98440-12901", "9844012901")
        """
        orig = str(raw_phone).strip()
        digits = re.sub(r'\D', '', orig)
        
        # Handle country code prefixes (e.g., 91 for India or 0 prefix)
        if len(digits) > 10:
            if digits.startswith("91") and len(digits) == 12:
                norm = digits[2:]
            elif digits.startswith("0") and len(digits) == 11:
                norm = digits[1:]
            else:
                norm = digits[-10:] if len(digits) >= 10 else digits
        else:
            norm = digits
            
        return orig, norm

    @staticmethod
    def normalize_mac(raw_mac: str) -> Tuple[str, str]:
        """
        Normalizes MAC addresses to uppercase colon-separated format.
        e.g. "00-1a-2b-3c-4d-5e" -> ("00-1a-2b-3c-4d-5e", "00:1A:2B:3C:4D:5E")
        """
        orig = str(raw_mac).strip()
        clean = re.sub(r'[^0-9A-Fa-f]', '', orig).upper()
        if len(clean) == 12:
            norm = ":".join(clean[i:i+2] for i in range(0, 12, 2))
        else:
            norm = clean
        return orig, norm

    @staticmethod
    def normalize_ip(raw_ip: str) -> Tuple[str, str]:
        """
        Validates and standardizes IP address representation.
        """
        orig = str(raw_ip).strip()
        try:
            addr = ipaddress.ip_address(orig)
            norm = str(addr)
        except ValueError:
            norm = orig
        return orig, norm

    @staticmethod
    def normalize_upi(raw_upi: str) -> Tuple[str, str]:
        """
        Normalizes UPI VPAs (lowercase, whitespace stripped).
        e.g. "MuleUser@OKAXIS " -> ("MuleUser@OKAXIS ", "muleuser@okaxis")
        """
        orig = str(raw_upi).strip()
        norm = orig.lower()
        return orig, norm

    @staticmethod
    def normalize_account(raw_acc: str) -> Tuple[str, str]:
        """
        Normalizes bank account numbers.
        Strips spaces, hyphens, prefixes.
        """
        orig = str(raw_acc).strip()
        norm = re.sub(r'[\s\-]', '', orig).upper()
        return orig, norm

    @staticmethod
    def normalize_imei(raw_imei: str) -> Tuple[str, str]:
        """
        Normalizes IMEI hardware identifier (digits only).
        """
        orig = str(raw_imei).strip()
        norm = re.sub(r'\D', '', orig)
        return orig, norm

    @classmethod
    def normalize_entity(cls, entity_type: str, raw_value: str) -> Tuple[str, str]:
        """Dispatches normalization based on entity type."""
        etype = str(entity_type).upper()
        if etype == "PHONE":
            return cls.normalize_phone(raw_value)
        elif etype == "MAC":
            return cls.normalize_mac(raw_value)
        elif etype == "IP":
            return cls.normalize_ip(raw_value)
        elif etype == "UPI":
            return cls.normalize_upi(raw_value)
        elif etype == "ACCOUNT":
            return cls.normalize_account(raw_value)
        elif etype in ("IMEI", "IMSI"):
            return cls.normalize_imei(raw_value)
        else:
            orig = str(raw_value).strip()
            return orig, orig.upper()
