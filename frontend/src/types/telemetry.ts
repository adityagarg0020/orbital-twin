export interface TelemetryData {
  step: number;
  timestamp: string;
  temperature: number;
  radiator_temp: number;
  cooling_efficiency: number;
  battery: number;
  battery_voltage: number;
  battery_current: number;
  battery_temperature: number;
  battery_health: number;
  solar_power: number;
  power_consumption: number;
  bus_voltage: number;
  fuel: number;
  fuel_pressure: number;
  thruster_pressure: number;
  thruster_temp: number;
  communication_signal: number;
  packet_loss: number;
  latency: number;
  snr: number;
  roll: number;
  pitch: number;
  yaw: number;
  angular_velocity: number;
  reaction_wheel_rpm: number;
  cpu: number;
  cpu_temp: number;
  memory_usage: number;
  power_health: number;
  thermal_health: number;
  battery_health_calc: number;
  propulsion_health: number;
  communication_health: number;
  attitude_health: number;
  overall_health: number;
  anomaly_score: number;
  anomaly_detected: boolean;
  anomaly_severity: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  highest_failure_risk: string;
  max_failure_prob: number;
  operating_mode: string;
  rul_hours: number;
  degradation_stage?: string;
  degradation_progress?: number;
  mission_elapsed_seconds?: number;
  data_source?: string;
}

export interface AnomalyItem {
  id: number;
  timestamp: string;
  subsystem: string;
  channel: string;
  score: number;
  severity: 'WARNING' | 'CRITICAL';
  affected_parameters: string[];
  description: string;
  is_nasa_benchmark: boolean;
  status: string;
}

export interface ContributingFactor {
  feature: string;
  weight: number;
  current_val: any;
}

export interface FailurePredictionItem {
  subsystem: string;
  failure_probability: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  predicted_issue: string;
  time_window: string;
  confidence: number;
  contributing_factors: ContributingFactor[];
}

export interface MissionEventItem {
  id: number;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  title: string;
  description: string;
  subsystem: string;
}

export interface SubsystemDetail {
  id: string;
  name: string;
  health: number;
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  trend: 'STABLE' | 'DEGRADING' | 'IMPROVING';
  telemetry: Record<string, number>;
  predicted_failure_probability: number;
  anomaly_active: boolean;
}

export interface RootCauseEvidence {
  parameter: string;
  label: string;
  unit: string;
  baseline: number;
  current: number;
  delta: number;
  percentage_delta: string;
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
}

export interface CausalChainNode {
  id: string;
  step: number;
  title: string;
  desc: string;
  type: 'TRIGGER' | 'MECHANISM' | 'SYMPTOM' | 'CONSEQUENCE' | 'RISK';
}

export interface RootCauseAnalysisData {
  subsystem: string;
  overall_health: number;
  highest_failure_probability: number;
  evidence: RootCauseEvidence[];
  causal_chain: CausalChainNode[];
  top_contributing_factors: ContributingFactor[];
}

export interface Recommendation {
  id: string;
  timestamp: string;
  subsystem: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  action_type: string;
  simulated_effect: string;
  simulation_parameters?: Record<string, any>;
  status: string;
}

export interface RULData {
  components: Record<string, {
    estimated_rul_hours: number;
    current_health: number;
    stress_factor: number;
    confidence_window: string;
    status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  }>;
  battery_curves: {
    historical: { time_offset_hours: number; health: number }[];
    projected: {
      time_offset_hours: number;
      estimated_health: number;
      confidence_upper_95: number;
      confidence_lower_95: number;
    }[];
  };
}
