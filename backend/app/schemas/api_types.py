from typing import List, Dict, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field

class TelemetryPayload(BaseModel):
    timestamp: datetime
    step: int
    
    # Thermal
    temperature: float
    radiator_temp: float
    cooling_efficiency: float
    
    # Battery & Power
    battery: float
    battery_voltage: float
    battery_current: float
    battery_temperature: float
    battery_health: float
    solar_power: float
    power_consumption: float
    bus_voltage: float
    
    # Propulsion
    fuel: float
    fuel_pressure: float
    thruster_pressure: float
    thruster_temp: float
    
    # Communication
    communication_signal: float
    packet_loss: float
    latency: float
    snr: float
    
    # Attitude
    roll: float
    pitch: float
    yaw: float
    angular_velocity: float
    reaction_wheel_rpm: float
    
    # Computing
    cpu: float
    cpu_temp: float
    memory_usage: float
    
    # Health percentages
    power_health: float
    thermal_health: float
    battery_health_calc: float
    propulsion_health: float
    communication_health: float
    attitude_health: float
    overall_health: float
    
    # Anomaly & ML
    anomaly_score: float
    anomaly_detected: bool
    anomaly_severity: str
    highest_failure_risk: str
    max_failure_prob: float
    operating_mode: str
    rul_hours: float

class SubsystemHealth(BaseModel):
    name: str
    health: float
    status: str  # NOMINAL, WARNING, CRITICAL
    trend: str   # STABLE, DEGRADING, IMPROVING
    last_telemetry: Dict[str, Any]
    anomaly_active: bool
    predicted_failure_probability: float
    active_alerts: List[str]

class AnomalyItem(BaseModel):
    id: int
    timestamp: datetime
    subsystem: str
    channel: str
    score: float
    severity: str
    affected_parameters: List[str]
    description: str
    is_nasa_benchmark: bool
    status: str

class FailurePredictionItem(BaseModel):
    subsystem: str
    failure_probability: float
    risk_level: str
    predicted_issue: str
    time_window: str
    confidence: float
    contributing_factors: List[Dict[str, Any]]

class MissionEventItem(BaseModel):
    id: int
    timestamp: datetime
    event_type: str
    title: str
    description: str
    severity: str
    subsystem: str

class SimulationRequest(BaseModel):
    scenario: str
    solar_power_reduction: float = 0.0  # percentage
    cooling_failure_percent: float = 0.0
    power_load_increase: float = 0.0
    communication_degradation: float = 0.0
    thruster_pressure_drop: float = 0.0
    battery_degradation: float = 0.0
    duration_hours: float = 6.0

class SimulationResult(BaseModel):
    id: str
    timestamp: datetime
    scenario_name: str
    duration_hours: float
    current_state: Dict[str, Any]
    simulated_state: Dict[str, Any]
    trajectories: List[Dict[str, Any]]
    outcome_summary: str
    recovery_possible: bool
    recommended_mitigation: str

class RecommendationItem(BaseModel):
    id: str
    timestamp: datetime
    subsystem: str
    title: str
    description: str
    priority: str
    action_type: str
    simulated_effect: str
    status: str

class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    sources: List[str]
    context_used: Dict[str, Any]

class DemoTriggerRequest(BaseModel):
    scenario: str  # NORMAL, THERMAL_DEGRADATION, BATTERY_FAILURE, COMMUNICATION_FAILURE, PROPULSION_ANOMALY, SOLAR_POWER_DROP
