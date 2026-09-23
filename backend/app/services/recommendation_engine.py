from typing import Dict, Any, List
from datetime import datetime

class RecommendationEngine:
    """
    Generates actionable operational recommendations with executable simulation links
    based on live anomaly detection and failure prediction state.
    """
    def generate_recommendations(
        self,
        telemetry: Dict[str, Any],
        anomalies: List[Dict[str, Any]],
        predictions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        recs = []
        
        # Check thermal risk
        thermal_risk = 0.0
        for p in predictions:
            if p["subsystem"] == "Thermal":
                thermal_risk = p["failure_probability"]
                
        cooling_eff = telemetry.get("cooling_efficiency", 100.0)
        temp = telemetry.get("temperature", 24.0)
        
        if thermal_risk > 0.50 or temp > 45.0 or cooling_eff < 60.0:
            recs.append({
                "id": "REC-TH-01",
                "timestamp": datetime.utcnow().isoformat(),
                "subsystem": "Thermal",
                "title": "Engage Secondary Radiator Fluid Loop & Shed Payload Power",
                "description": (
                    f"Thermal failure probability is elevated at {round(thermal_risk * 100, 1)}% "
                    f"with bus temperature at {temp}°C. Recommended mitigation: 1) Throttle non-essential "
                    f"instrument payloads by 35% to reduce internal heat generation by ~190W. "
                    f"2) Simulate activation of auxiliary coolant circuit loop B."
                ),
                "priority": "HIGH" if thermal_risk > 0.70 else "MEDIUM",
                "action_type": "SIMULATE_COOLING_AND_LOAD_SHED",
                "simulated_effect": "Projects -14.2°C thermal reduction and restores mission health to >88%.",
                "simulation_parameters": {
                    "scenario": "Cooling Recovery + Load Shedding",
                    "cooling_failure_percent": max(0.0, 100.0 - cooling_eff - 45.0),
                    "power_load_increase": -35.0,
                    "duration_hours": 6.0
                },
                "status": "PENDING"
            })
            recs.append({
                "id": "REC-TH-02",
                "timestamp": datetime.utcnow().isoformat(),
                "subsystem": "Thermal",
                "title": "Slew Solar Arrays 15° Off-Sun to Reduce Direct Radiation Flux",
                "description": "Adjust solar array drive gimbal angle by -15.0° to lower solar absorption during sunlit arc.",
                "priority": "MEDIUM",
                "action_type": "SLEW_SOLAR_PANELS",
                "simulated_effect": "Reduces solar heat flux by 85W with nominal 8% generation trade-off.",
                "simulation_parameters": {
                    "scenario": "Solar Off-Pointing",
                    "solar_power_reduction": 8.0,
                    "duration_hours": 4.0
                },
                "status": "PENDING"
            })

        # Check battery risk
        bat_risk = 0.0
        for p in predictions:
            if p["subsystem"] == "Battery":
                bat_risk = p["failure_probability"]
        bat_v = telemetry.get("battery_voltage", 28.2)
        if bat_risk > 0.45 or bat_v < 24.5:
            recs.append({
                "id": "REC-BAT-01",
                "timestamp": datetime.utcnow().isoformat(),
                "subsystem": "Battery",
                "title": "Disable High-Current Payloads to Mitigate Voltage Sag",
                "description": f"Battery bus voltage at {bat_v}V indicates accelerated discharge strain. Isolate non-critical bus segments.",
                "priority": "HIGH",
                "action_type": "ISOLATE_HIGH_CURRENT_BUS",
                "simulated_effect": "Stabilizes bus voltage at 26.8V and extends battery cycle life.",
                "simulation_parameters": {
                    "scenario": "Battery Load Relief",
                    "power_load_increase": -40.0,
                    "duration_hours": 8.0
                },
                "status": "PENDING"
            })
            
        # Check communication risk
        comm_risk = 0.0
        for p in predictions:
            if p["subsystem"] == "Communication":
                comm_risk = p["failure_probability"]
        packet_loss = telemetry.get("packet_loss", 0.05)
        if comm_risk > 0.45 or packet_loss > 5.0:
            recs.append({
                "id": "REC-COM-01",
                "timestamp": datetime.utcnow().isoformat(),
                "subsystem": "Communication",
                "title": "Switch to Low-Gain Omnidirectional Antenna & Re-calibrate Gimbal",
                "description": f"RF packet loss at {packet_loss}%. Command High-Gain Antenna closed-loop repointing.",
                "priority": "HIGH",
                "action_type": "REPOINT_HGA",
                "simulated_effect": "Restores RF link margin to >22 dB with packet loss <0.1%.",
                "simulation_parameters": {
                    "scenario": "Antenna Realignment",
                    "communication_degradation": 0.0,
                    "duration_hours": 2.0
                },
                "status": "PENDING"
            })
            
        # Default nominal recommendations if all is well
        if not recs:
            recs.append({
                "id": "REC-NOM-01",
                "timestamp": datetime.utcnow().isoformat(),
                "subsystem": "General",
                "title": "Maintain Autonomous Orbit Maintenance & Telemetry Logging",
                "description": "All subsystems are within nominal operational boundaries (Mission Health > 94%). Proceed with standard flight plan.",
                "priority": "LOW",
                "action_type": "NOMINAL_KEEPING",
                "simulated_effect": "Zero disruption; stable baseline maintained.",
                "simulation_parameters": {
                    "scenario": "Nominal Baseline",
                    "duration_hours": 12.0
                },
                "status": "ACTIVE"
            })
            
        return recs

recommendation_engine = RecommendationEngine()
