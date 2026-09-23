import copy
from typing import Dict, Any, List, Tuple
from datetime import datetime

class ScenarioManager:
    """
    Manages active operating scenarios, smooth degradation progressions,
    and counterfactual what-if projection simulations.
    """
    def __init__(self):
        self.active_scenario = "NORMAL"
        self.scenario_start_time = 0.0
        self.elapsed_in_scenario = 0.0
        self.transition_duration = 35.0  # seconds to reach maximum degradation smoothly
        
    def set_scenario(self, scenario_name: str, current_time: float):
        self.active_scenario = scenario_name.upper()
        self.scenario_start_time = current_time
        self.elapsed_in_scenario = 0.0

    def get_progress(self) -> float:
        """Normalized progression 0.0 to 1.0 along degradation sequence."""
        if self.active_scenario == "NORMAL":
            return 0.0
        return min(1.0, self.elapsed_in_scenario / self.transition_duration)

    def get_stage_name(self, progress: float) -> str:
        if self.active_scenario == "NORMAL" or progress <= 0.05:
            return "NORMAL"
        elif progress < 0.25:
            return "MINOR DEVIATION"
        elif progress < 0.45:
            return "EARLY ANOMALY"
        elif progress < 0.65:
            return "WARNING"
        elif progress < 0.85:
            return "DEGRADATION"
        elif progress < 0.95:
            return "CRITICAL"
        else:
            return "FAILURE IMMINENT"

    def get_physics_overrides(self, dt: float) -> Tuple[Dict[str, Any], str, float]:
        """
        Calculates physics engine parameter overrides based on current scenario and progress.
        Returns: (overrides_dict, stage_name, progress)
        """
        self.elapsed_in_scenario += dt
        progress = self.get_progress()
        stage = self.get_stage_name(progress)
        overrides = {}

        if self.active_scenario == "NORMAL":
            return overrides, stage, 0.0

        elif self.active_scenario == "THERMAL_DEGRADATION":
            # Cooling efficiency degrades from 100% down to 18%
            overrides["cooling_efficiency"] = 100.0 - (82.0 * progress)
            # Power consumption slightly increases due to coolant pump over-exertion
            overrides["payload_power"] = 550.0 + (140.0 * progress)
            # CPU workload increases due to thermal throttling loops
            overrides["cpu_load_mult"] = 1.0 + (0.55 * progress)

        elif self.active_scenario == "BATTERY_FAILURE":
            # Battery internal resistance spikes
            overrides["battery_degradation_mult"] = 1.0 + (4.2 * progress)
            overrides["payload_power"] = 550.0 + (90.0 * progress)

        elif self.active_scenario == "COMMUNICATION_FAILURE":
            # Gimbal pointing error grows from 0.02 to 0.85 deg
            overrides["pointing_error"] = 0.02 + (0.83 * progress)
            overrides["comm_loss_factor"] = 1.0 * progress

        elif self.active_scenario == "PROPULSION_ANOMALY":
            # Valve leak & regulator malfunction
            overrides["fuel_leak_rate"] = 0.005 * progress
            overrides["propulsion_fault"] = progress > 0.35

        elif self.active_scenario == "SOLAR_POWER_DROP":
            # Solar efficiency multiplier drops to 38%
            overrides["solar_efficiency_mult"] = 1.0 - (0.62 * progress)

        return overrides, stage, progress

    def run_what_if_simulation(
        self,
        current_telemetry: Dict[str, Any],
        solar_power_reduction: float = 0.0,
        cooling_failure_percent: float = 0.0,
        power_load_increase: float = 0.0,
        communication_degradation: float = 0.0,
        thruster_pressure_drop: float = 0.0,
        battery_degradation: float = 0.0,
        duration_hours: float = 6.0
    ) -> Dict[str, Any]:
        """
        Fast-forward counterfactual simulation across duration_hours.
        Compares WITHOUT INTERVENTION (unmitigated drift) vs WITH INTERVENTION.
        """
        from backend.app.simulation.physics_engine import PhysicsEngine
        
        steps = 30  # Data points for trajectory curves
        dt_sim = (duration_hours * 3600.0) / steps
        
        # Branch A: Baseline / Projected Drift (No Mitigation)
        engine_a = PhysicsEngine()
        # Seed from current telemetry
        engine_a.temperature = current_telemetry.get("temperature", 24.0)
        engine_a.battery_soc = current_telemetry.get("battery", 85.0)
        engine_a.cooling_efficiency = current_telemetry.get("cooling_efficiency", 100.0)
        engine_a.solar_power = current_telemetry.get("solar_power", 1400.0)
        
        # Apply scenario perturbation
        overrides_a = {
            "solar_efficiency_mult": max(0.1, 1.0 - (solar_power_reduction / 100.0)),
            "cooling_efficiency": max(10.0, current_telemetry.get("cooling_efficiency", 100.0) - cooling_failure_percent),
            "payload_power": 550.0 * (1.0 + (power_load_increase / 100.0)),
            "comm_loss_factor": communication_degradation / 100.0,
            "battery_degradation_mult": 1.0 + (battery_degradation / 100.0) * 3.0,
            "propulsion_fault": thruster_pressure_drop > 25.0
        }
        
        # Branch B: With Mitigating Action (e.g. shed load 35% + backup cooling loop activated)
        engine_b = copy.deepcopy(engine_a)
        overrides_b = copy.deepcopy(overrides_a)
        # Mitigation restores 45% cooling capacity and cuts payload power by 35%
        overrides_b["cooling_efficiency"] = min(95.0, overrides_b["cooling_efficiency"] + 45.0)
        overrides_b["payload_power"] = max(200.0, overrides_b["payload_power"] * 0.65)
        overrides_b["cpu_load_mult"] = 0.75  # Low-power computing safe-mode
        
        trajectories = []
        for i in range(steps + 1):
            t_hour = round((i * dt_sim) / 3600.0, 2)
            
            res_a = engine_a.step(dt=dt_sim, overrides=overrides_a)
            res_b = engine_b.step(dt=dt_sim, overrides=overrides_b)
            
            trajectories.append({
                "hour": t_hour,
                "unmitigated_health": res_a["overall_health"],
                "mitigated_health": res_b["overall_health"],
                "unmitigated_temp": res_a["temperature"],
                "mitigated_temp": res_b["temperature"],
                "unmitigated_battery": res_a["battery"],
                "mitigated_battery": res_b["battery"]
            })
            
        final_a = trajectories[-1]
        final_b = trajectories[-1]
        
        summary = (
            f"Without intervention, spacecraft health declines to {final_a['unmitigated_health']}% "
            f"with internal temperature reaching {final_a['unmitigated_temp']}°C. "
            f"Under recommended mitigation (35% power shed + redundant cooling circuit activation), "
            f"system health recovers to {final_b['mitigated_health']}% with stable thermal margin at {final_b['mitigated_temp']}°C."
        )
        
        return {
            "scenario_name": "What-If Counterfactual Assessment",
            "duration_hours": duration_hours,
            "current_state": {
                "health": current_telemetry.get("overall_health", 95.0),
                "temperature": current_telemetry.get("temperature", 24.0),
                "battery": current_telemetry.get("battery", 90.0)
            },
            "simulated_state": {
                "unmitigated_health": final_a["unmitigated_health"],
                "mitigated_health": final_b["mitigated_health"],
                "unmitigated_temp": final_a["unmitigated_temp"],
                "mitigated_temp": final_b["mitigated_temp"],
                "unmitigated_battery": final_a["unmitigated_battery"],
                "mitigated_battery": final_b["mitigated_battery"]
            },
            "trajectories": trajectories,
            "outcome_summary": summary,
            "recovery_possible": final_b["mitigated_health"] >= 75.0,
            "recommended_mitigation": "Shed non-critical payload bus load by 35% and engage auxiliary radiator fluid loop B."
        }
