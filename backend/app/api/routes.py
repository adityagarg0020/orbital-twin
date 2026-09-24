import csv
import io
import json
import math
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query, HTTPException, Body
from backend.app.services.telemetry_service import telemetry_service
from backend.app.services.causal_engine import causal_engine
from backend.app.services.recommendation_engine import recommendation_engine
from backend.app.services.grok_service import grok_service
from backend.app.ml.anomaly_detector import anomaly_detector
from backend.app.ml.failure_predictor import failure_predictor
from backend.app.ml.rul_estimator import rul_estimator
from backend.app.ml.nasa_loader import nasa_loader
from backend.app.database.connection import SessionLocal
from backend.app.models.schema import ModelMetadataModel
from backend.app.websocket.connection_manager import connection_manager
from backend.app.config import settings
from backend.app.schemas.api_types import (
    SimulationRequest, SimulationResult, ChatRequest, ChatResponse, DemoTriggerRequest,
    ManualDataValidationRequest, ManualDataValidationResponse,
    ManualDataAnalysisRequest, ManualDataAnalysisResponse,
    ManualLoadIntoTwinRequest, SystemHealthResponse, HealthComponent
)

api_router = APIRouter(prefix="/api")

@api_router.get("/health", response_model=SystemHealthResponse)
def get_health():
    # Database check
    db_ok = True
    db_msg = "Connected"
    try:
        db = SessionLocal()
        count = db.query(ModelMetadataModel).count()
        db.close()
        db_msg = f"Connected ({count} registered models)"
    except Exception as e:
        db_ok = False
        db_msg = f"Degraded: {str(e)}"

    # ML models check
    ml_ok = anomaly_detector.is_ready and failure_predictor.is_ready
    ml_msg = "Isolation Forest & XGBoost operational" if ml_ok else "ML models initializing"

    # Grok AI check
    grok_status = "ONLINE" if bool(settings.GROK_API_KEY) else "STANDBY"
    grok_msg = "xAI Grok API active" if bool(settings.GROK_API_KEY) else "Aerospace deterministic fallback engine active"

    # WebSocket check
    ws_conns = len(connection_manager.active_connections)
    ws_msg = f"{ws_conns} active connection{'s' if ws_conns != 1 else ''}"

    overall_status = "ONLINE" if (db_ok and ml_ok) else "DEGRADED"

    return {
        "status": overall_status,
        "service": "ORBITAL TWIN Mission Backend",
        "timestamp": datetime.utcnow().isoformat(),
        "data_source": telemetry_service.data_source,
        "components": {
            "backend": {
                "status": "ONLINE",
                "details": f"FastAPI runtime running on port {settings.PORT}"
            },
            "database": {
                "status": "ONLINE" if db_ok else "OFFLINE",
                "details": db_msg
            },
            "ml_models": {
                "status": "ONLINE" if ml_ok else "DEGRADED",
                "details": ml_msg
            },
            "simulator": {
                "status": "ONLINE" if telemetry_service.is_running else "PAUSED",
                "details": f"Speed: {telemetry_service.speed_multiplier}x, Mode: {telemetry_service.scenario_mgr.active_scenario}"
            },
            "grok_ai": {
                "status": grok_status,
                "details": grok_msg
            },
            "websocket": {
                "status": "ONLINE",
                "details": ws_msg,
                "metrics": {"active_clients": ws_conns}
            }
        }
    }

@api_router.get("/telemetry/data-source")
def get_data_source():
    return {
        "data_source": telemetry_service.data_source,
        "is_simulation_running": telemetry_service.is_running,
        "operating_mode": telemetry_service.scenario_mgr.active_scenario
    }

@api_router.get("/spacecraft")
def get_spacecraft():
    latest = telemetry_service.get_latest_state()
    return {
        "id": "SPACECRAFT-01",
        "name": "ORBITAL TWIN ALPHA",
        "mission": "ORBITAL-X",
        "status": "NOMINAL" if latest.get("overall_health", 95.0) > 75.0 else ("WARNING" if latest.get("overall_health", 95.0) > 50.0 else "CRITICAL"),
        "overall_health": latest.get("overall_health", 95.0),
        "operating_mode": telemetry_service.scenario_mgr.active_scenario,
        "mission_elapsed_seconds": telemetry_service.mission_elapsed_seconds,
        "active_anomalies_count": len(telemetry_service.active_anomalies),
        "highest_failure_risk": latest.get("highest_failure_risk", "NONE"),
        "degradation_stage": latest.get("degradation_stage", "NORMAL")
    }

@api_router.get("/telemetry/latest")
def get_latest_telemetry():
    return telemetry_service.get_latest_state()

@api_router.get("/telemetry/history")
def get_telemetry_history(points: int = Query(60, ge=5, le=300)):
    hist = list(telemetry_service.history)
    return hist[-points:] if len(hist) >= points else hist

@api_router.get("/subsystems")
def get_subsystems_health():
    latest = telemetry_service.get_latest_state()
    predictions = telemetry_service.latest_predictions
    
    def get_pred(sub: str) -> float:
        for p in predictions:
            if p["subsystem"].lower() == sub.lower():
                return p["failure_probability"]
        return 0.05

    subsystems = [
        {
            "id": "power",
            "name": "Electrical Power Subsystem (EPS)",
            "health": latest.get("power_health", 96.0),
            "status": "CRITICAL" if latest.get("power_health", 96.0) < 50 else ("WARNING" if latest.get("power_health", 96.0) < 80 else "NOMINAL"),
            "trend": "DEGRADING" if latest.get("power_health", 96.0) < 85 else "STABLE",
            "telemetry": {
                "solar_power": latest.get("solar_power", 1450.0),
                "consumption": latest.get("power_consumption", 820.0),
                "bus_voltage": latest.get("bus_voltage", 28.1)
            },
            "predicted_failure_probability": get_pred("Power"),
            "anomaly_active": any(a["subsystem"] == "Power" for a in telemetry_service.active_anomalies)
        },
        {
            "id": "battery",
            "name": "Battery Storage & Management",
            "health": latest.get("battery_health_calc", 97.0),
            "status": "CRITICAL" if latest.get("battery_health_calc", 97.0) < 50 else ("WARNING" if latest.get("battery_health_calc", 97.0) < 80 else "NOMINAL"),
            "trend": "DEGRADING" if latest.get("battery_health_calc", 97.0) < 85 else "STABLE",
            "telemetry": {
                "soc": latest.get("battery", 92.0),
                "voltage": latest.get("battery_voltage", 28.2),
                "temperature": latest.get("battery_temperature", 21.0),
                "current": latest.get("battery_current", 4.2)
            },
            "predicted_failure_probability": get_pred("Battery"),
            "anomaly_active": any(a["subsystem"] == "Battery" for a in telemetry_service.active_anomalies)
        },
        {
            "id": "thermal",
            "name": "Thermal Control Subsystem (TCS)",
            "health": latest.get("thermal_health", 95.0),
            "status": "CRITICAL" if latest.get("thermal_health", 95.0) < 50 else ("WARNING" if latest.get("thermal_health", 95.0) < 80 else "NOMINAL"),
            "trend": "DEGRADING" if latest.get("thermal_health", 95.0) < 85 else "STABLE",
            "telemetry": {
                "temperature": latest.get("temperature", 24.0),
                "radiator_temp": latest.get("radiator_temp", -18.0),
                "cooling_efficiency": latest.get("cooling_efficiency", 100.0)
            },
            "predicted_failure_probability": get_pred("Thermal"),
            "anomaly_active": any(a["subsystem"] == "Thermal" for a in telemetry_service.active_anomalies)
        },
        {
            "id": "propulsion",
            "name": "Propulsion & Reaction Control",
            "health": latest.get("propulsion_health", 98.0),
            "status": "CRITICAL" if latest.get("propulsion_health", 98.0) < 50 else ("WARNING" if latest.get("propulsion_health", 98.0) < 80 else "NOMINAL"),
            "trend": "DEGRADING" if latest.get("propulsion_health", 98.0) < 85 else "STABLE",
            "telemetry": {
                "fuel_remaining": latest.get("fuel", 84.5),
                "fuel_pressure": latest.get("fuel_pressure", 220.0),
                "thruster_pressure": latest.get("thruster_pressure", 18.5)
            },
            "predicted_failure_probability": get_pred("Propulsion"),
            "anomaly_active": any(a["subsystem"] == "Propulsion" for a in telemetry_service.active_anomalies)
        },
        {
            "id": "communication",
            "name": "Telemetry, Tracking & Comms (TT&C)",
            "health": latest.get("communication_health", 95.0),
            "status": "CRITICAL" if latest.get("communication_health", 95.0) < 50 else ("WARNING" if latest.get("communication_health", 95.0) < 80 else "NOMINAL"),
            "trend": "DEGRADING" if latest.get("communication_health", 95.0) < 85 else "STABLE",
            "telemetry": {
                "signal_strength": latest.get("communication_signal", 94.0),
                "packet_loss": latest.get("packet_loss", 0.05),
                "snr": latest.get("snr", 28.5)
            },
            "predicted_failure_probability": get_pred("Communication"),
            "anomaly_active": any(a["subsystem"] == "Communication" for a in telemetry_service.active_anomalies)
        },
        {
            "id": "attitude",
            "name": "Attitude Determination & Control (ADCS)",
            "health": latest.get("attitude_health", 98.0),
            "status": "NOMINAL",
            "trend": "STABLE",
            "telemetry": {
                "roll": latest.get("roll", 0.02),
                "pitch": latest.get("pitch", -0.01),
                "yaw": latest.get("yaw", 0.03),
                "wheel_rpm": latest.get("reaction_wheel_rpm", 3200.0)
            },
            "predicted_failure_probability": get_pred("Attitude"),
            "anomaly_active": any(a["subsystem"] == "Attitude" for a in telemetry_service.active_anomalies)
        }
    ]
    return subsystems

@api_router.get("/anomalies")
def get_anomalies():
    return telemetry_service.active_anomalies

@api_router.get("/predictions")
def get_predictions():
    return telemetry_service.latest_predictions

@api_router.get("/root-cause/latest")
def get_root_cause():
    latest = telemetry_service.get_latest_state()
    return causal_engine.analyze_root_cause(
        latest, telemetry_service.active_anomalies, telemetry_service.latest_predictions
    )

@api_router.get("/rul")
def get_rul():
    latest = telemetry_service.get_latest_state()
    return telemetry_service.latest_rul or {"components": {}, "battery_curves": {}}

@api_router.get("/recommendations")
def get_recommendations():
    latest = telemetry_service.get_latest_state()
    return recommendation_engine.generate_recommendations(
        latest, telemetry_service.active_anomalies, telemetry_service.latest_predictions
    )

@api_router.get("/timeline")
def get_timeline():
    return telemetry_service.timeline_events

@api_router.get("/models/status")
def get_model_status():
    db = SessionLocal()
    records = db.query(ModelMetadataModel).all()
    res = [
        {
            "id": r.id,
            "model_name": r.model_name,
            "version": r.version,
            "trained_date": r.trained_date.isoformat() if r.trained_date else None,
            "algorithm": r.algorithm,
            "accuracy": r.accuracy,
            "f1_score": r.f1_score,
            "roc_auc": r.roc_auc,
            "dataset_info": r.dataset_info,
            "status": r.status
        }
        for r in records
    ]
    db.close()
    return res

@api_router.get("/nasa/channels")
def get_nasa_channels():
    return nasa_loader.get_channel_summary()

@api_router.get("/nasa/channels/{chan_id}")
def get_nasa_channel_data(chan_id: str, split: str = "test"):
    data = nasa_loader.load_channel_data(chan_id, split)
    if not data:
        raise HTTPException(status_code=404, detail=f"NASA channel {chan_id} not found.")
    # Return downsampled primary signal for chart performance
    step = max(1, len(data["primary_signal"]) // 500)
    data["sampled_signal"] = data["primary_signal"][::step]
    data["sample_indices"] = list(range(0, len(data["primary_signal"]), step))
    return data

@api_router.post("/simulation/start")
def start_simulation():
    telemetry_service.set_running(True)
    return {"status": "RUNNING"}

@api_router.post("/simulation/pause")
def pause_simulation():
    telemetry_service.set_running(False)
    return {"status": "PAUSED"}

@api_router.post("/simulation/reset")
def reset_simulation():
    telemetry_service.reset()
    return {"status": "RESET"}

@api_router.post("/simulation/speed")
def set_speed(speed: float = Body(..., embed=True)):
    telemetry_service.set_speed(speed)
    return {"speed": telemetry_service.speed_multiplier}

@api_router.post("/simulation/run")
def run_what_if_simulation(req: SimulationRequest):
    latest = telemetry_service.get_latest_state()
    res = telemetry_service.scenario_mgr.run_what_if_simulation(
        current_telemetry=latest,
        solar_power_reduction=req.solar_power_reduction,
        cooling_failure_percent=req.cooling_failure_percent,
        power_load_increase=req.power_load_increase,
        communication_degradation=req.communication_degradation,
        thruster_pressure_drop=req.thruster_pressure_drop,
        battery_degradation=req.battery_degradation,
        duration_hours=req.duration_hours
    )
    telemetry_service._record_event(
        "INFO",
        "WHAT-IF SIMULATION EXECUTED",
        f"Simulated scenario: {req.scenario} across {req.duration_hours}h duration.",
        "SIMULATION"
    )
    return res

@api_router.post("/demo/trigger")
def trigger_demo_scenario(req: DemoTriggerRequest):
    res = telemetry_service.trigger_scenario(req.scenario)
    return res

@api_router.post("/ai/chat", response_model=ChatResponse)
async def chat_with_assistant(req: ChatRequest):
    latest = telemetry_service.get_latest_state()
    history_dicts = [{"role": m.role, "content": m.content} for m in req.conversation_history]
    res = await grok_service.generate_response(
        user_message=req.message,
        spacecraft_state=latest,
        conversation_history=history_dicts
    )
    return res

# ==============================================================
# MANUAL TELEMETRY DATA LAB ENDPOINTS
# ==============================================================

SUPPORTED_TARGET_FIELDS = [
    "timestamp",
    "temperature",
    "battery",
    "voltage",
    "current",
    "fuel",
    "fuel_pressure",
    "thruster_pressure",
    "solar_power",
    "communication_signal",
    "packet_loss",
    "attitude",
    "CPU",
    "thermal_health",
    "battery_health",
    "propulsion_health",
    "failure_type",
    "RUL",
    "anomaly"
]

FIELD_RANGES = {
    "battery": (0.0, 100.0, "Battery SOC must be between 0% and 100%"),
    "temperature": (-100.0, 150.0, "Temperature must be between -100°C and 150°C"),
    "voltage": (0.0, 100.0, "Voltage must be between 0V and 100V"),
    "current": (-100.0, 100.0, "Current must be between -100A and 100A"),
    "fuel": (0.0, 100.0, "Fuel level must be between 0% and 100%"),
    "fuel_pressure": (0.0, 500.0, "Fuel pressure must be between 0 and 500 bar/psi"),
    "thruster_pressure": (0.0, 200.0, "Thruster pressure must be between 0 and 200 bar/psi"),
    "solar_power": (0.0, 5000.0, "Solar power must be between 0W and 5000W"),
    "communication_signal": (0.0, 100.0, "Communication signal must be between 0% and 100%"),
    "packet_loss": (0.0, 100.0, "Packet loss must be between 0% and 100%"),
    "attitude": (-180.0, 180.0, "Attitude must be between -180 and 180 deg"),
    "CPU": (0.0, 100.0, "CPU load must be between 0% and 100%"),
    "thermal_health": (0.0, 100.0, "Thermal health must be between 0% and 100%"),
    "battery_health": (0.0, 100.0, "Battery health must be between 0% and 100%"),
    "propulsion_health": (0.0, 100.0, "Propulsion health must be between 0% and 100%"),
    "RUL": (0.0, 100000.0, "RUL must be non-negative")
}

DEFAULT_COLUMN_ALIASES = {
    "temperature": ["temp", "temperature", "temp_sensor_01", "tcs_temp", "radiator_temp", "thermal_temp"],
    "battery": ["battery", "bat", "bat_soc", "soc", "battery_soc", "charge"],
    "voltage": ["voltage", "bus_v", "battery_voltage", "v_bus", "bus_voltage"],
    "current": ["current", "battery_current", "i_bus", "bus_current"],
    "fuel": ["fuel", "fuel_level", "fuel_remaining", "propellant"],
    "fuel_pressure": ["fuel_pressure", "press_fuel", "fuel_press"],
    "thruster_pressure": ["thr_pressure", "thruster_pressure", "rcs_pressure"],
    "solar_power": ["solar_power", "solar_pwr", "pv_power", "generation"],
    "communication_signal": ["communication_signal", "comm_signal", "signal", "rf_signal", "signal_strength"],
    "packet_loss": ["packet_loss", "pkt_loss", "drop_rate"],
    "attitude": ["attitude", "pointing_error", "roll", "pitch", "yaw"],
    "CPU": ["cpu", "cpu_load", "cpu_usage", "processor"],
    "thermal_health": ["thermal_health", "tcs_health"],
    "battery_health": ["battery_health", "bat_health"],
    "propulsion_health": ["propulsion_health", "prop_health"],
    "failure_type": ["failure_type", "failure", "predicted_failure"],
    "RUL": ["rul", "remaining_useful_life", "rul_hours"],
    "anomaly": ["anomaly", "anomaly_flag", "is_anomaly", "label"],
    "timestamp": ["timestamp", "time", "date", "datetime", "met"]
}

def auto_detect_mapping(columns: List[str]) -> Dict[str, str]:
    mapping = {}
    for col in columns:
        col_lower = col.strip().lower().replace("-", "_").replace(" ", "_")
        for target, aliases in DEFAULT_COLUMN_ALIASES.items():
            if col_lower in aliases or col_lower == target.lower():
                mapping[col] = target
                break
    return mapping

@api_router.post("/telemetry/manual/validate", response_model=ManualDataValidationResponse)
def validate_manual_data(req: ManualDataValidationRequest):
    rows: List[Dict[str, Any]] = []
    
    # 1. Parse CSV or JSON content
    if req.csv_content and req.csv_content.strip():
        try:
            f = io.StringIO(req.csv_content.strip())
            reader = csv.DictReader(f)
            rows = [dict(r) for r in reader]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"CSV Parsing Error: {str(e)}")
    elif req.json_content and req.json_content.strip():
        try:
            parsed = json.loads(req.json_content.strip())
            rows = parsed if isinstance(parsed, list) else [parsed]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"JSON Parsing Error: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Either csv_content or json_content must be provided.")

    if not rows:
        raise HTTPException(status_code=400, detail="Uploaded dataset contains zero records.")

    # 2. Extract detected columns
    detected_columns = list(rows[0].keys())
    
    # Auto-map columns if not explicitly provided
    active_mapping = req.column_mapping if req.column_mapping else auto_detect_mapping(detected_columns)
    
    # 3. Analyze data types, missing values, range violations
    missing_count = 0
    invalid_count = 0
    total_cells = len(rows) * len(detected_columns)
    errors: List[str] = []
    warnings: List[str] = []
    data_types: Dict[str, str] = {}
    timestamps: List[str] = []

    # Detect data types based on non-null values
    for col in detected_columns:
        col_type = "string"
        sample_vals = [r[col] for r in rows if r.get(col) is not None and str(r.get(col)).strip() != ""]
        if sample_vals:
            # Check if numeric
            is_num = True
            for v in sample_vals[:50]:
                try:
                    float(v)
                except ValueError:
                    is_num = False
                    break
            if is_num:
                col_type = "number"
            elif any(k in col.lower() for k in ["time", "date"]):
                col_type = "datetime"
        data_types[col] = col_type

    # Validate each row
    for idx, row in enumerate(rows):
        row_num = idx + 1
        for col in detected_columns:
            val = row.get(col)
            
            # Missing value check
            if val is None or str(val).strip() in ["", "nan", "null", "none", "NA"]:
                missing_count += 1
                continue
                
            mapped_target = active_mapping.get(col)
            
            # Track timestamp
            if mapped_target == "timestamp":
                timestamps.append(str(val).strip())

            # Range & Numeric Checks for mapped numeric fields
            if mapped_target and mapped_target in FIELD_RANGES:
                try:
                    num_val = float(val)
                    min_val, max_val, msg = FIELD_RANGES[mapped_target]
                    if num_val < min_val or num_val > max_val:
                        invalid_count += 1
                        if len(errors) < 25:
                            errors.append(f"Row {row_num}: Column '{col}' value {num_val} violates physical limits. {msg}")
                except (ValueError, TypeError):
                    invalid_count += 1
                    if len(errors) < 25:
                        errors.append(f"Row {row_num}: Column '{col}' has invalid value '{val}'. {mapped_target.capitalize()} must be numeric.")

    # Duplicate timestamp check
    if timestamps and len(timestamps) > len(set(timestamps)):
        warnings.append(f"Dataset contains {len(timestamps) - len(set(timestamps))} duplicate timestamp entries.")

    # Time range estimation
    time_range = "N/A"
    if timestamps:
        try:
            t0 = datetime.fromisoformat(timestamps[0].replace("Z", "+00:00"))
            t1 = datetime.fromisoformat(timestamps[-1].replace("Z", "+00:00"))
            delta = abs(t1 - t0)
            hours = delta.total_seconds() / 3600
            time_range = f"{round(hours, 2)} hours ({timestamps[0][:19]} to {timestamps[-1][:19]})"
        except Exception:
            time_range = f"{timestamps[0]} to {timestamps[-1]}"

    missing_percentage = round((missing_count / total_cells * 100) if total_cells > 0 else 0.0, 2)
    is_valid = len(errors) == 0

    if not is_valid:
        status_label = "VALIDATION FAILED"
    elif len(active_mapping) < 3:
        status_label = "NEEDS COLUMN MAPPING"
    else:
        status_label = "READY FOR ANALYSIS"

    return {
        "is_valid": is_valid,
        "row_count": len(rows),
        "column_count": len(detected_columns),
        "detected_columns": detected_columns,
        "mapped_columns": active_mapping,
        "missing_values_count": missing_count,
        "missing_percentage": missing_percentage,
        "invalid_values_count": invalid_count,
        "data_types": data_types,
        "preview_rows": rows[:20],
        "errors": errors,
        "warnings": warnings,
        "time_range": time_range,
        "status": status_label
    }

@api_router.post("/telemetry/manual/analyze", response_model=ManualDataAnalysisResponse)
def analyze_manual_telemetry(req: ManualDataAnalysisRequest):
    # Determine the target telemetry point
    mapped_point: Dict[str, Any] = {}
    
    if req.raw_point:
        # User provided direct JSON point
        if isinstance(req.raw_point, list) and len(req.raw_point) > 0:
            mapped_point = dict(req.raw_point[-1])
        elif isinstance(req.raw_point, dict):
            mapped_point = dict(req.raw_point)
    elif req.rows and len(req.rows) > 0:
        # User provided multiple rows with optional column mapping
        mapping = req.column_mapping or auto_detect_mapping(list(req.rows[0].keys()))
        latest_row = req.rows[-1]
        for src_col, target_field in mapping.items():
            if src_col in latest_row and latest_row[src_col] is not None:
                val = latest_row[src_col]
                try:
                    mapped_point[target_field] = float(val) if target_field != "timestamp" and target_field != "failure_type" else val
                except (ValueError, TypeError):
                    mapped_point[target_field] = val
    else:
        raise HTTPException(status_code=400, detail="No telemetry data provided for analysis.")

    # Merge with nominal baseline to ensure all models receive complete feature vector
    baseline = telemetry_service.get_latest_state()
    telemetry = {**baseline, **mapped_point}
    telemetry["data_source"] = "UPLOADED DATA"
    telemetry["timestamp"] = mapped_point.get("timestamp") or datetime.utcnow().isoformat()

    # Synchronize complementary fields
    if "battery" in mapped_point:
        telemetry["battery"] = float(mapped_point["battery"])
        telemetry["battery_health"] = float(mapped_point["battery"])
    if "voltage" in mapped_point:
        telemetry["bus_voltage"] = float(mapped_point["voltage"])
        telemetry["battery_voltage"] = float(mapped_point["voltage"])
    if "current" in mapped_point:
        telemetry["battery_current"] = float(mapped_point["current"])
    if "CPU" in mapped_point:
        telemetry["cpu"] = float(mapped_point["CPU"])
    if "attitude" in mapped_point:
        telemetry["roll"] = float(mapped_point["attitude"])

    # 1. ML Anomaly Detection (Isolation Forest)
    anomaly_res = anomaly_detector.predict(telemetry)
    telemetry["anomaly_score"] = anomaly_res["anomaly_score"]
    telemetry["anomaly_detected"] = anomaly_res["anomaly_detected"]
    telemetry["anomaly_severity"] = anomaly_res["severity"]

    # 2. ML Failure Prediction (XGBoost)
    history_records = list(telemetry_service.history)
    predictions = failure_predictor.predict_all(telemetry, history_records)

    # 3. Dynamic Subsystem Health Calculations
    # Thermal Health
    temp = telemetry.get("temperature", 24.0)
    cooling = telemetry.get("cooling_efficiency", 100.0)
    thermal_health = max(10.0, min(100.0, 100.0 - (max(0.0, temp - 30.0) * 2.2) - (100.0 - cooling) * 0.4))
    telemetry["thermal_health"] = round(thermal_health, 1)

    # Battery Health
    bat_soc = telemetry.get("battery", 92.0)
    bat_v = telemetry.get("bus_voltage", 28.2)
    battery_health = max(10.0, min(100.0, (bat_soc * 0.6) + ((bat_v / 28.0) * 40.0)))
    telemetry["battery_health_calc"] = round(battery_health, 1)

    # Propulsion Health
    fuel_p = telemetry.get("fuel_pressure", 220.0)
    thr_p = telemetry.get("thruster_pressure", 18.5)
    prop_health = max(10.0, min(100.0, 100.0 - abs(fuel_p - 220.0) * 0.3 - abs(thr_p - 18.5) * 2.5))
    telemetry["propulsion_health"] = round(prop_health, 1)

    # Communication Health
    sig = telemetry.get("communication_signal", 94.0)
    pkt_loss = telemetry.get("packet_loss", 0.05)
    comm_health = max(10.0, min(100.0, sig - (pkt_loss * 15.0)))
    telemetry["communication_health"] = round(comm_health, 1)

    # Power Health
    sol = telemetry.get("solar_power", 1450.0)
    pwr_health = max(10.0, min(100.0, (sol / 1450.0) * 100.0))
    telemetry["power_health"] = round(pwr_health, 1)

    # Overall Spacecraft Health
    overall = (thermal_health * 0.22 + battery_health * 0.22 + prop_health * 0.18 + comm_health * 0.18 + pwr_health * 0.20)
    telemetry["overall_health"] = round(overall, 1)

    subsystem_health = {
        "Thermal": round(thermal_health, 1),
        "Battery": round(battery_health, 1),
        "Power": round(pwr_health, 1),
        "Propulsion": round(prop_health, 1),
        "Communication": round(comm_health, 1),
        "Attitude": 98.0,
        "Overall": round(overall, 1)
    }

    # 4. RUL Estimation
    rul = rul_estimator.estimate_components(telemetry)
    if "Battery" in rul.get("components", {}):
        telemetry["rul_hours"] = rul["components"]["Battery"]["estimated_rul_hours"]

    # 5. Root Cause Analysis
    active_anomalies_list = []
    if anomaly_res["anomaly_detected"]:
        active_anomalies_list.append({
            "id": 999,
            "subsystem": anomaly_res["subsystem"],
            "severity": anomaly_res["severity"],
            "score": anomaly_res["anomaly_score"],
            "description": f"Significant variance detected in {anomaly_res['subsystem']}.",
            "affected_parameters": [f["parameter"] for f in anomaly_res["deviant_features"]]
        })

    root_cause = causal_engine.analyze_root_cause(telemetry, active_anomalies_list, predictions)

    # 6. Actionable Recommendations
    recommendations = recommendation_engine.generate_recommendations(telemetry, active_anomalies_list, predictions)

    # 7. Summary
    anom_status = f"{anomaly_res['severity']} anomaly detected in {anomaly_res['subsystem']}" if anomaly_res["anomaly_detected"] else "Nominal state within baseline variance."
    highest_risk_pred = max(predictions, key=lambda x: x["failure_probability"]) if predictions else None
    pred_status = f"Highest predicted failure risk: {highest_risk_pred['subsystem']} ({int(highest_risk_pred['failure_probability']*100)}% probability)." if highest_risk_pred else ""

    summary_text = f"Manual telemetry analysis complete. Overall Spacecraft Health: {telemetry['overall_health']}%. {anom_status} {pred_status}"

    return {
        "telemetry": telemetry,
        "anomaly_detection": anomaly_res,
        "failure_predictions": predictions,
        "subsystem_health": subsystem_health,
        "root_cause": root_cause,
        "recommendations": recommendations,
        "rul": rul,
        "summary": summary_text
    }

@api_router.post("/telemetry/manual/load-into-twin")
async def load_manual_telemetry_into_twin(req: ManualLoadIntoTwinRequest):
    updated_state = await telemetry_service.ingest_manual_telemetry(
        manual_state=req.telemetry,
        anomalies=req.anomalies,
        predictions=req.predictions,
        rul=req.rul,
        source_name=req.source_name or "UPLOADED DATA"
    )
    return {
        "status": "SUCCESS",
        "message": "Manual telemetry successfully ingested into Digital Twin.",
        "data_source": telemetry_service.data_source,
        "telemetry": updated_state
    }

@api_router.post("/telemetry/manual/reset")
async def reset_manual_telemetry_demo():
    await telemetry_service.reset_to_demo_data()
    return {
        "status": "SUCCESS",
        "message": "Spacecraft telemetry restored to nominal simulation environment.",
        "data_source": telemetry_service.data_source
    }

@api_router.post("/telemetry/manual/clear")
async def clear_manual_telemetry_data():
    await telemetry_service.clear_uploaded_data()
    return {
        "status": "SUCCESS",
        "message": "Uploaded data cleared. Spacecraft telemetry restored to nominal simulation baseline.",
        "data_source": telemetry_service.data_source
    }
