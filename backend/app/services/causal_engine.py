from typing import Dict, Any, List
from backend.app.ml.anomaly_detector import AnomalyDetector

class CausalEngine:
    """
    Root Cause Analysis engine.
    Constructs explainable causal progression graphs, empirical evidence deltas,
    and feature attribution rankings from actual current telemetry and ML outputs.
    """
    def analyze_root_cause(
        self,
        telemetry: Dict[str, Any],
        active_anomalies: List[Dict[str, Any]],
        predictions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        baseline = AnomalyDetector.NOMINAL_BASELINE
        
        # 1. Determine primary subsystem affected
        primary_subsystem = "Thermal"
        highest_risk = 0.0
        
        for p in predictions:
            if p["failure_probability"] > highest_risk:
                highest_risk = p["failure_probability"]
                primary_subsystem = p["subsystem"]
                
        # 2. Build Empirical Evidence Table
        evidence = []
        key_params = [
            ("temperature", "Internal Temperature", "°C"),
            ("cooling_efficiency", "Cooling Loop Efficiency", "%"),
            ("power_consumption", "Power Consumption", "W"),
            ("battery_voltage", "Bus Voltage", "V"),
            ("battery_temperature", "Battery Temperature", "°C"),
            ("fuel_pressure", "Propellant Pressure", "bar"),
            ("packet_loss", "RF Packet Loss", "%"),
            ("cpu", "CPU Core Utilization", "%")
        ]
        
        for key, label, unit in key_params:
            curr = telemetry.get(key)
            if curr is None:
                continue
            base_m, base_s = baseline.get(key, (curr, 1.0))
            delta_val = curr - base_m
            pct_delta = round((delta_val / (base_m if base_m != 0 else 1.0)) * 100.0, 1)
            
            # Highlight items with meaningful delta
            if abs(pct_delta) >= 5.0 or (key == "packet_loss" and curr > 0.2):
                evidence.append({
                    "parameter": key,
                    "label": label,
                    "unit": unit,
                    "baseline": round(base_m, 2),
                    "current": round(curr, 2),
                    "delta": round(delta_val, 2),
                    "percentage_delta": f"{'+' if pct_delta > 0 else ''}{pct_delta}%",
                    "status": "CRITICAL" if abs(pct_delta) > 30 else ("WARNING" if abs(pct_delta) > 12 else "NOMINAL")
                })
                
        # 3. Dynamic Causal Chain Graph Nodes
        causal_chains = {
            "Thermal": [
                {"id": "node_1", "step": 1, "title": "Coolant Loop Degradation", "desc": f"Radiator efficiency declined to {telemetry.get('cooling_efficiency', 100)}%", "type": "TRIGGER"},
                {"id": "node_2", "step": 2, "title": "Heat Dissipation Deficit", "desc": "Radiative heat rejection rate fell below electronics thermal output", "type": "MECHANISM"},
                {"id": "node_3", "step": 3, "title": "Thermal Accumulation", "desc": f"Bus temperature rose to {telemetry.get('temperature', 24)}°C (delta {round(telemetry.get('temperature', 24) - 24.0, 1)}°C)", "type": "SYMPTOM"},
                {"id": "node_4", "step": 4, "title": "Subsystem Stress Escalation", "desc": f"Battery heated to {telemetry.get('battery_temperature', 21)}°C, increasing internal resistance", "type": "CONSEQUENCE"},
                {"id": "node_5", "step": 5, "title": "Failure Risk Threshold", "desc": f"XGBoost model projects {round(highest_risk * 100, 1)}% thermal failure probability", "type": "RISK"}
            ],
            "Battery": [
                {"id": "node_1", "step": 1, "title": "Cell Internal Resistance Spike", "desc": f"Bus voltage dropped to {telemetry.get('battery_voltage', 28.2)}V under load", "type": "TRIGGER"},
                {"id": "node_2", "step": 2, "title": "Ohmic Heating Acceleration", "desc": f"Joule heating elevated cell temp to {telemetry.get('battery_temperature', 21)}°C", "type": "MECHANISM"},
                {"id": "node_3", "step": 3, "title": "Discharge Capacity Sag", "desc": f"State of charge depleted to {telemetry.get('battery', 90)}%", "type": "SYMPTOM"},
                {"id": "node_4", "step": 4, "title": "Bus Voltage Instability", "desc": "Voltage margin insufficient for secondary payload loads", "type": "CONSEQUENCE"},
                {"id": "node_5", "step": 5, "title": "Battery Failure Risk", "desc": f"Predicted probability {round(highest_risk * 100, 1)}% within 3-5h", "type": "RISK"}
            ],
            "Propulsion": [
                {"id": "node_1", "step": 1, "title": "Line Pressure Drop", "desc": f"Propellant feed pressure collapsed to {telemetry.get('fuel_pressure', 220)} bar", "type": "TRIGGER"},
                {"id": "node_2", "step": 2, "title": "Chamber Feed Starvation", "desc": f"Thruster chamber pressure reached {telemetry.get('thruster_pressure', 18.5)} bar", "type": "MECHANISM"},
                {"id": "node_3", "step": 3, "title": "Impulse Asymmetry", "desc": "Attitude jitter induced during delta-V maneuvers", "type": "CONSEQUENCE"},
                {"id": "node_4", "step": 4, "title": "Propulsion Hazard", "desc": f"Predicted failure probability {round(highest_risk * 100, 1)}%", "type": "RISK"}
            ],
            "Communication": [
                {"id": "node_1", "step": 1, "title": "Antenna Pointing Deviation", "desc": f"Gimbal alignment error increased to {telemetry.get('roll', 0.02)}°", "type": "TRIGGER"},
                {"id": "node_2", "step": 2, "title": "RF Carrier Degradation", "desc": f"Link SNR dropped to {telemetry.get('snr', 28.5)} dB", "type": "MECHANISM"},
                {"id": "node_3", "step": 3, "title": "Data Loss & Retransmission", "desc": f"Packet loss rate spiked to {telemetry.get('packet_loss', 0.05)}%", "type": "SYMPTOM"},
                {"id": "node_4", "step": 4, "title": "Command Link Loss Risk", "desc": f"Predicted probability {round(highest_risk * 100, 1)}%", "type": "RISK"}
            ]
        }
        
        chain = causal_chains.get(primary_subsystem, causal_chains["Thermal"])
        
        # 4. Top Contributing Factors from prediction model
        contributing_factors = []
        for p in predictions:
            if p["subsystem"] == primary_subsystem:
                contributing_factors = p.get("contributing_factors", [])
                break
                
        return {
            "subsystem": primary_subsystem,
            "overall_health": telemetry.get("overall_health", 95.0),
            "highest_failure_probability": highest_risk,
            "evidence": evidence,
            "causal_chain": chain,
            "top_contributing_factors": contributing_factors
        }

causal_engine = CausalEngine()
