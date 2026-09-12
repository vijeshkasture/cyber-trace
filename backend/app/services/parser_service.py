import json
from pathlib import Path
from typing import List, Dict, Any, Tuple
import pandas as pd


class ParserService:
    """
    Forensic file parsing service using Pandas.
    Supports CSV, Excel (.xlsx, .xls), and JSON evidence files with tolerant column mapping.
    """

    COLUMN_SYNONYMS = {
        "source_account": ["source_account", "from_account", "sender", "remitter", "payer", "source", "account_from", "dr_account", "source_acc", "sender_account"],
        "target_account": ["target_account", "to_account", "receiver", "beneficiary", "payee", "target", "account_to", "cr_account", "dest_acc", "target_acc", "beneficiary_account"],
        "amount": ["amount", "amt", "tx_amount", "transaction_amount", "value", "transfer_amount"],
        "timestamp": ["timestamp", "date", "time", "tx_time", "datetime", "transaction_date", "event_time", "logged_at"],
        "transaction_id": ["transaction_id", "tx_id", "reference_no", "utr", "ref_no", "reference", "txn_id", "rrn"],
        "channel": ["channel", "mode", "payment_mode", "payment_method", "type", "txn_type"],
        
        # Telephony CDR synonyms
        "caller": ["caller", "calling_number", "source_phone", "from_phone", "caller_msisdn", "a_party", "source_mobile", "phone_a"],
        "callee": ["callee", "called_number", "target_phone", "to_phone", "called_msisdn", "b_party", "dest_mobile", "phone_b"],
        "phone": ["phone", "phone_number", "mobile", "msisdn", "contact", "sim_number"],
        "imei": ["imei", "device_imei", "imei_number", "imei1", "handset_imei", "hardware_imei"],
        "imsi": ["imsi", "device_imsi", "imsi_number"],
        
        # IPDR / Network synonyms
        "ip": ["ip", "ip_address", "client_ip", "source_ip", "egress_ip", "dest_ip", "host_ip", "ipv4"],
        "mac": ["mac", "mac_address", "device_mac", "hardware_mac", "bssid"],
        "upi": ["upi", "upi_id", "vpa", "payer_vpa", "payee_vpa", "upi_handle"],
        "institution": ["institution", "bank", "bank_name", "isp", "telecom", "operator", "branch"]
    }

    @classmethod
    def find_canonical_field(cls, col_name: str) -> str | None:
        """Maps a column name to its canonical field name if matched."""
        clean = col_name.strip().lower().replace(" ", "_").replace("-", "_").replace(".", "_")
        for canonical, syns in cls.COLUMN_SYNONYMS.items():
            if clean in syns or clean.endswith(f"_{canonical}"):
                return canonical
        return None

    @classmethod
    def normalize_dataframe_columns(cls, df: pd.DataFrame) -> pd.DataFrame:
        """Renames recognized synonym columns to canonical names while keeping others."""
        rename_map = {}
        for col in df.columns:
            canonical = cls.find_canonical_field(str(col))
            if canonical and canonical not in rename_map.values():
                rename_map[col] = canonical
        return df.rename(columns=rename_map)

    @classmethod
    def parse_file(cls, file_path: str | Path) -> Tuple[List[Dict[str, Any]], int]:
        """
        Parses a file from disk into a list of normalized dictionaries.
        Returns: (records, record_count)
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        ext = path.suffix.lower()

        try:
            if ext == ".csv":
                df = pd.read_csv(path, dtype=str)
            elif ext in [".xlsx", ".xls"]:
                df = pd.read_excel(path, dtype=str)
            elif ext == ".json":
                # Check if it's a JSON array or object
                with open(path, "r", encoding="utf-8") as f:
                    content = json.load(f)
                if isinstance(content, list):
                    df = pd.DataFrame(content)
                elif isinstance(content, dict):
                    # Check if there's a records or data key
                    for key in ["records", "data", "rows", "events", "transactions"]:
                        if key in content and isinstance(content[key], list):
                            df = pd.DataFrame(content[key])
                            break
                    else:
                        df = pd.DataFrame([content])
                else:
                    df = pd.DataFrame()
            else:
                raise ValueError(f"Unsupported file format for forensic parsing: {ext}")

            # Fill NA/None values with empty string or sensible default
            df = df.fillna("")
            df = cls.normalize_dataframe_columns(df)
            records = df.to_dict(orient="records")
            return records, len(records)

        except Exception as e:
            raise ValueError(f"Failed to parse evidence file {path.name}: {str(e)}")
