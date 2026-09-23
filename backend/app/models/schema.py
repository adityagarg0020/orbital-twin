from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from backend.app.database.connection import Base

class SpacecraftModel(Base):
    __tablename__ = "spacecraft"

    id = Column(String(50), primary_key=True, default="SPACECRAFT-01")
    name = Column(String(100), default="ORBITAL TWIN ALPHA")
    mission_name = Column(String(100), default="ORBITAL-X")
    status = Column(String(50), default="NOMINAL")
    overall_health = Column(Float, default=95.0)
    operating_mode = Column(String(50), default="NORMAL")
    simulation_state = Column(String(50), default="RUNNING")
    mission_elapsed_seconds = Column(Integer, default=3648240)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TelemetryRecordModel(Base):
    __tablename__ = "telemetry_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    step = Column(Integer, default=0)
    
    # Thermal
    temperature = Column(Float, default=24.5)  # °C
    radiator_temp = Column(Float, default=-15.2)  # °C
    cooling_efficiency = Column(Float, default=100.0)  # %
    
    # Battery & Power
    battery = Column(Float, default=92.4)  # State of Charge %
    battery_voltage = Column(Float, default=28.4)  # V
    battery_current = Column(Float, default=4.2)  # A
    battery_temperature = Column(Float, default=21.0)  # °C
    battery_health = Column(Float, default=98.0)  # %
    solar_power = Column(Float, default=1450.0)  # W
    power_consumption = Column(Float, default=820.0)  # W
    bus_voltage = Column(Float, default=28.1)  # V
    
    # Propulsion
    fuel = Column(Float, default=84.5)  # % remaining
    fuel_pressure = Column(Float, default=220.0)  # bar
    thruster_pressure = Column(Float, default=18.5)  # bar
    thruster_temp = Column(Float, default=18.0)  # °C
    
    # Communication
    communication_signal = Column(Float, default=94.0)  # Signal strength %
    packet_loss = Column(Float, default=0.08)  # %
    latency = Column(Float, default=124.0)  # ms
    snr = Column(Float, default=28.5)  # dB
    
    # Attitude & Dynamics
    roll = Column(Float, default=0.02)  # deg
    pitch = Column(Float, default=-0.01)  # deg
    yaw = Column(Float, default=0.04)  # deg
    angular_velocity = Column(Float, default=0.005)  # deg/s
    reaction_wheel_rpm = Column(Float, default=3200.0)  # rpm
    
    # Computing & Avionics
    cpu = Column(Float, default=38.5)  # %
    cpu_temp = Column(Float, default=42.0)  # °C
    memory_usage = Column(Float, default=45.2)  # %
    
    # Health Scores
    power_health = Column(Float, default=96.0)
    thermal_health = Column(Float, default=95.0)
    battery_health_calc = Column(Float, default=97.0)
    propulsion_health = Column(Float, default=98.0)
    communication_health = Column(Float, default=95.0)
    attitude_health = Column(Float, default=98.0)
    overall_health = Column(Float, default=96.5)
    
    # ML & Anomaly values
    anomaly_score = Column(Float, default=0.05)
    anomaly_detected = Column(Boolean, default=False)
    anomaly_severity = Column(String(20), default="NOMINAL")
    highest_failure_risk = Column(String(50), default="NONE")
    max_failure_prob = Column(Float, default=0.04)

class AnomalyRecordModel(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    subsystem = Column(String(50), nullable=False)
    channel = Column(String(50), nullable=False)
    score = Column(Float, nullable=False)
    severity = Column(String(20), default="WARNING")  # WARNING, CRITICAL
    affected_parameters = Column(JSON, default=list)
    description = Column(String(255), nullable=False)
    is_nasa_benchmark = Column(Boolean, default=False)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, RESOLVED, MITIGATING

class PredictionRecordModel(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    subsystem = Column(String(50), nullable=False)
    failure_probability = Column(Float, nullable=False)  # 0.0 - 1.0
    risk_level = Column(String(20), default="LOW")  # LOW, MODERATE, HIGH, CRITICAL
    predicted_issue = Column(String(255), nullable=False)
    time_window = Column(String(50), default="2-4 hours")
    confidence = Column(Float, default=0.85)
    contributing_factors = Column(JSON, default=list)

class MissionEventModel(Base):
    __tablename__ = "mission_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    event_type = Column(String(50), nullable=False)  # TELEMETRY, ANOMALY, PREDICTION, ROOT_CAUSE, RECOMMENDATION, SIMULATION, ACTION
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="INFO")  # INFO, WARNING, CRITICAL, SUCCESS
    subsystem = Column(String(50), default="SYSTEM")

class SimulationRunModel(Base):
    __tablename__ = "simulation_runs"

    id = Column(String(50), primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    scenario_name = Column(String(100), nullable=False)
    duration_hours = Column(Float, default=6.0)
    parameters = Column(JSON, default=dict)
    current_state = Column(JSON, default=dict)
    simulated_state = Column(JSON, default=dict)
    projections = Column(JSON, default=list)
    outcome_summary = Column(Text, default="")

class RecommendationModel(Base):
    __tablename__ = "recommendations"

    id = Column(String(50), primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    subsystem = Column(String(50), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(20), default="HIGH")  # LOW, MEDIUM, HIGH, IMMEDIATE
    action_type = Column(String(50), nullable=False)
    simulated_effect = Column(Text, default="")
    status = Column(String(20), default="PENDING")  # PENDING, SIMULATED, APPLIED

class ModelMetadataModel(Base):
    __tablename__ = "model_metadata"

    id = Column(String(50), primary_key=True)
    model_name = Column(String(100), nullable=False)
    version = Column(String(50), default="v1.0.0")
    trained_date = Column(DateTime, default=datetime.utcnow)
    algorithm = Column(String(100), nullable=False)
    accuracy = Column(Float, default=0.0)
    f1_score = Column(Float, default=0.0)
    roc_auc = Column(Float, default=0.0)
    dataset_info = Column(String(200), default="NASA SMAP/MSL + Synthetic Spacecraft Physics")
    status = Column(String(50), default="ONLINE")
