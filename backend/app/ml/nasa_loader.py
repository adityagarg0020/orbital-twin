import os
import ast
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from backend.app.config import settings

class NASALoader:
    """
    Ingests and provides access to the real NASA SMAP/MSL benchmark telemetry dataset.
    Preserves chronological order, channel IDs, and ground truth anomaly sequences.
    """
    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path or settings.NASA_DATA_PATH
        self.labeled_csv_path = os.path.join(self.data_path, "labeled_anomalies.csv")
        self.train_dir = os.path.join(self.data_path, "data", "data", "train")
        self.test_dir = os.path.join(self.data_path, "data", "data", "test")
        
        self.df_labels: Optional[pd.DataFrame] = None
        self._load_labels()
        
    def _load_labels(self):
        if os.path.exists(self.labeled_csv_path):
            self.df_labels = pd.read_csv(self.labeled_csv_path)
            # Parse stringified lists
            self.df_labels["anomaly_sequences_parsed"] = self.df_labels["anomaly_sequences"].apply(
                lambda x: ast.literal_eval(x) if isinstance(x, str) else []
            )
        else:
            print(f"Warning: NASA labels CSV not found at {self.labeled_csv_path}")
            self.df_labels = pd.DataFrame()

    def get_channel_summary(self) -> List[Dict[str, Any]]:
        """Returns metadata for all available NASA SMAP/MSL telemetry channels."""
        if self.df_labels.empty:
            return []
            
        summary = []
        for _, row in self.df_labels.iterrows():
            chan = row["chan_id"]
            # Subsystem classification by prefix
            subsystem_map = {
                "P": "Power",
                "T": "Thermal",
                "E": "ECLSS / Environmental",
                "A": "Attitude & Pointing",
                "S": "Systems",
                "D": "Data Handling",
                "F": "Flight Software",
                "G": "Guidance & Control",
                "M": "Mechanisms",
                "R": "Radio Frequency"
            }
            prefix = chan.split("-")[0] if "-" in chan else chan[0]
            subsystem = subsystem_map.get(prefix, "General Avionics")
            
            summary.append({
                "chan_id": chan,
                "spacecraft": row["spacecraft"],
                "subsystem": subsystem,
                "num_values": int(row["num_values"]),
                "anomaly_count": len(row["anomaly_sequences_parsed"]),
                "anomaly_sequences": row["anomaly_sequences_parsed"],
                "anomaly_class": str(row["class"])
            })
        return summary

    def load_channel_data(self, chan_id: str, split: str = "test") -> Optional[Dict[str, Any]]:
        """
        Loads numpy telemetry array for a specific channel.
        split: 'train' or 'test'.
        In NASA SMAP/MSL, index 0 is the primary telemetry channel; indices 1..24 are commands/features.
        """
        target_dir = self.train_dir if split == "train" else self.test_dir
        file_path = os.path.join(target_dir, f"{chan_id}.npy")
        
        if not os.path.exists(file_path):
            return None
            
        data = np.load(file_path)
        primary_signal = data[:, 0].tolist()
        
        # Ground truth anomaly mask
        is_anomaly = [False] * len(primary_signal)
        anomaly_windows = []
        
        if split == "test" and not self.df_labels.empty:
            row = self.df_labels[self.df_labels["chan_id"] == chan_id]
            if not row.empty:
                anomaly_windows = row.iloc[0]["anomaly_sequences_parsed"]
                for seq in anomaly_windows:
                    start_idx, end_idx = seq[0], min(seq[1], len(is_anomaly))
                    for i in range(start_idx, end_idx):
                        is_anomaly[i] = True
                        
        return {
            "chan_id": chan_id,
            "split": split,
            "total_points": len(primary_signal),
            "primary_signal": primary_signal,
            "anomaly_windows": anomaly_windows,
            "is_anomaly": is_anomaly
        }

    def get_multi_channel_training_matrix(self, channels: List[str] = None) -> np.ndarray:
        """
        Extracts synchronized training slices from key SMAP/MSL channels to train ML baseline.
        """
        channels = channels or ["P-1", "T-1", "A-1", "E-1", "S-1"]
        arrays = []
        min_len = 999999
        
        for ch in channels:
            fp = os.path.join(self.train_dir, f"{ch}.npy")
            if os.path.exists(fp):
                arr = np.load(fp)[:, 0]  # Take primary channel
                arrays.append(arr)
                min_len = min(min_len, len(arr))
                
        if not arrays:
            # Fallback synthetic matrix
            return np.random.normal(0, 1, (1000, 5))
            
        trimmed = [arr[:min_len] for arr in arrays]
        return np.column_stack(trimmed)

nasa_loader = NASALoader()
