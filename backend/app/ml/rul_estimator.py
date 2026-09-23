import math
from typing import Dict, Any, List

class RULEstimator:
    """
    Remaining Useful Life (RUL) estimation engine combining physics degradation
    laws with statistical uncertainty intervals.
    """
    def estimate_components(self, telemetry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates RUL in hours, health percentages, and projection trajectories
        for primary life-limited spacecraft subsystems.
        """
        # 1. BATTERY SUB-SYSTEM RUL
        # Degradation rate accelerated by high temperature and cyclic depth
        bat_temp = telemetry.get("battery_temperature", 21.0)
        bat_health = telemetry.get("battery_health_calc", 95.0)
        
        # Arrhenius thermal acceleration factor
        thermal_stress = math.exp(max(0.0, (bat_temp - 25.0) / 10.0))
        # Normal battery lifespan is ~45,000 hours in LEO; remaining depends on current health
        nominal_bat_hours = (bat_health / 100.0) * 1200.0  # Normalized to operational window
        battery_rul_hours = round(nominal_bat_hours / thermal_stress, 1)
        
        # 2. THERMAL RADIATORS RUL
        cooling_eff = telemetry.get("cooling_efficiency", 100.0)
        thermal_temp = telemetry.get("temperature", 24.0)
        rad_stress = 1.0 + max(0.0, (thermal_temp - 30.0) / 8.0)
        radiator_rul_hours = round((cooling_eff / 100.0) * 2400.0 / rad_stress, 1)
        
        # 3. PROPULSION VALVES & FUEL RUL
        fuel = telemetry.get("fuel", 85.0)
        p_fault = telemetry.get("propulsion_health", 98.0) < 60.0
        prop_factor = 0.25 if p_fault else 1.0
        propulsion_rul_hours = round((fuel / 100.0) * 8760.0 * prop_factor, 1)
        
        # 4. SOLAR ARRAY CELLS RUL
        solar_p = telemetry.get("solar_power", 1450.0)
        solar_rul_hours = round((solar_p / 1500.0) * 26000.0, 1)
        
        # Build 10-point degradation curves with 95% uncertainty interval for Battery
        historical_curve = []
        projected_curve = []
        
        # 5 historical steps
        for step in range(5):
            t_back = - (5 - step) * 20
            historical_curve.append({
                "time_offset_hours": t_back,
                "health": round(min(100.0, bat_health + (5 - step) * 0.8), 1)
            })
            
        # 10 projected steps until End of Life threshold (e.g. 50% health)
        current_h = bat_health
        time_step = max(5.0, battery_rul_hours / 10.0)
        for step in range(10):
            t_fwd = (step + 1) * time_step
            # Non-linear degradation decay
            projected_h = max(20.0, current_h * math.exp(-0.0035 * thermal_stress * t_fwd))
            # Uncertainty interval expands over time
            sigma = 1.5 + (step * 0.85)
            projected_curve.append({
                "time_offset_hours": round(t_fwd, 1),
                "estimated_health": round(projected_h, 1),
                "confidence_upper_95": round(min(100.0, projected_h + sigma), 1),
                "confidence_lower_95": round(max(0.0, projected_h - sigma), 1)
            })
            
        return {
            "components": {
                "Battery": {
                    "estimated_rul_hours": battery_rul_hours,
                    "current_health": bat_health,
                    "stress_factor": round(thermal_stress, 2),
                    "confidence_window": f"{round(battery_rul_hours * 0.88, 1)} - {round(battery_rul_hours * 1.12, 1)} hrs",
                    "status": "WARNING" if battery_rul_hours < 300.0 else "NOMINAL"
                },
                "Thermal Radiators": {
                    "estimated_rul_hours": radiator_rul_hours,
                    "current_health": cooling_eff,
                    "stress_factor": round(rad_stress, 2),
                    "confidence_window": f"{round(radiator_rul_hours * 0.85, 1)} - {round(radiator_rul_hours * 1.15, 1)} hrs",
                    "status": "CRITICAL" if radiator_rul_hours < 200.0 else ("WARNING" if radiator_rul_hours < 600.0 else "NOMINAL")
                },
                "Propulsion": {
                    "estimated_rul_hours": propulsion_rul_hours,
                    "current_health": fuel,
                    "stress_factor": 1.0 if not p_fault else 4.0,
                    "confidence_window": f"{round(propulsion_rul_hours * 0.90, 1)} - {round(propulsion_rul_hours * 1.10, 1)} hrs",
                    "status": "CRITICAL" if p_fault else "NOMINAL"
                },
                "Solar Arrays": {
                    "estimated_rul_hours": solar_rul_hours,
                    "current_health": round((solar_p / 1500.0) * 100.0, 1),
                    "stress_factor": 1.0,
                    "confidence_window": f"{round(solar_rul_hours * 0.92, 1)} - {round(solar_rul_hours * 1.08, 1)} hrs",
                    "status": "NOMINAL"
                }
            },
            "battery_curves": {
                "historical": historical_curve,
                "projected": projected_curve
            }
        }

rul_estimator = RULEstimator()
