import math
import random
from typing import Dict, Any

class PhysicsEngine:
    """
    Physics-informed coupled state model for spacecraft subsystems:
    Power, Thermal, Battery, Propulsion, Communication, Attitude, and Computing.
    """
    def __init__(self):
        # Mission & Orbital timing
        self.step_counter = 0
        self.orbit_period = 5520  # 92 minutes LEO in seconds
        self.time_seconds = 0.0
        
        # State: Thermal
        self.temperature = 23.4        # °C Main avionics bus
        self.radiator_temp = -18.2     # °C Radiator surface
        self.cooling_efficiency = 100.0# % Loop health
        self.thermal_capacity = 25000.0# J/K
        self.ambient_space_temp = 3.0  # K
        
        # State: Power & Battery
        self.battery_soc = 92.4        # %
        self.battery_capacity_wh = 4200.0 # Watt-hours
        self.nominal_voltage = 28.0    # V
        self.battery_voltage = 28.3    # V
        self.battery_current = 4.1     # A
        self.battery_internal_r = 0.045# Ohms
        self.battery_temperature = 21.2# °C
        self.battery_health = 98.0     # % SOH
        self.solar_panel_area = 6.2    # m^2
        self.solar_efficiency = 0.295  # 29.5% GaAs multi-junction
        self.solar_power = 1450.0      # W
        self.base_power_consumption = 780.0 # W
        self.power_consumption = 820.0 # W
        
        # State: Propulsion
        self.fuel_mass_percent = 84.5  # %
        self.tank_nominal_pressure = 220.0 # bar
        self.fuel_pressure = 219.4     # bar
        self.thruster_pressure = 18.5  # bar
        self.thruster_temp = 18.2      # °C
        
        # State: Communication
        self.comm_signal_pct = 94.0    # %
        self.packet_loss_pct = 0.05    # %
        self.latency_ms = 118.0        # ms
        self.snr_db = 28.5             # dB
        self.antenna_pointing_error = 0.02 # degrees
        
        # State: ADCS Attitude
        self.roll = 0.02               # deg
        self.pitch = -0.01             # deg
        self.yaw = 0.03                # deg
        self.angular_velocity = 0.005  # deg/s
        self.reaction_wheel_rpm = 3200.0 # rpm
        
        # State: Computing (CDH)
        self.cpu_load = 38.5           # %
        self.cpu_temp = 41.5           # °C
        self.memory_usage = 45.0       # %

    def step(self, dt: float = 1.0, overrides: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Advance physics simulation by dt seconds.
        Overrides allow scenario degradation injection.
        """
        self.step_counter += 1
        self.time_seconds += dt
        overrides = overrides or {}

        # 1. ORBITAL PHASE (Sunlit vs Eclipse)
        # Solar flux varies along orbital phase angle
        orbit_phase = (self.time_seconds % self.orbit_period) / self.orbit_period
        # Let sunlit phase be ~65% of orbit, eclipse ~35%
        in_sun = math.sin(orbit_phase * 2 * math.pi) > -0.35
        solar_zenith_factor = max(0.0, math.sin(orbit_phase * 2 * math.pi) + 0.35) if in_sun else 0.0
        
        # Scenario override: Solar degradation or drop
        solar_efficiency_mult = overrides.get("solar_efficiency_mult", 1.0)
        max_solar_flux = 1361.0 * self.solar_panel_area * self.solar_efficiency * solar_efficiency_mult
        
        if in_sun:
            base_solar_gen = max_solar_flux * (0.85 + 0.15 * math.sin(self.time_seconds * 0.05))
            self.solar_power = max(100.0, base_solar_gen * min(1.0, solar_zenith_factor + 0.2))
        else:
            self.solar_power = 0.0  # In eclipse
        
        # Micro-fluctuations
        self.solar_power += random.uniform(-4.0, 4.0)

        # 2. COMPUTING & LOAD DYNAMICS
        cpu_load_mult = overrides.get("cpu_load_mult", 1.0)
        self.cpu_load = max(10.0, min(100.0, (36.0 + 8.0 * math.sin(self.time_seconds * 0.1) + random.uniform(-1.5, 1.5)) * cpu_load_mult))
        self.memory_usage = max(20.0, min(95.0, 44.0 + 0.1 * math.sin(self.time_seconds * 0.02) + random.uniform(-0.2, 0.2)))
        
        # Computing power draw
        cdh_power = 90.0 + (self.cpu_load / 100.0) * 85.0
        
        # Payload / transmitter power draw
        comm_power_load = overrides.get("comm_power_load", 120.0)
        payload_power = overrides.get("payload_power", 550.0)
        
        self.power_consumption = self.base_power_consumption + cdh_power + comm_power_load + payload_power + random.uniform(-5.0, 5.0)

        # 3. BATTERY & BUS POWER NET
        net_power = self.solar_power - self.power_consumption
        battery_degradation_mult = overrides.get("battery_degradation_mult", 1.0)
        self.battery_internal_r = 0.045 * battery_degradation_mult
        
        if net_power >= 0:
            # Charging
            charge_eff = 0.94
            delta_wh = (net_power * dt / 3600.0) * charge_eff
            self.battery_soc = min(100.0, self.battery_soc + (delta_wh / self.battery_capacity_wh) * 100.0)
            self.battery_current = max(0.5, (net_power / self.nominal_voltage) * 0.85)
        else:
            # Discharging
            discharge_eff = 0.96
            delta_wh = (abs(net_power) * dt / 3600.0) / discharge_eff
            self.battery_soc = max(15.0, self.battery_soc - (delta_wh / self.battery_capacity_wh) * 100.0)
            self.battery_current = max(1.0, abs(net_power) / self.nominal_voltage)
            
        # Bus voltage with internal resistance sag
        soc_factor = self.battery_soc / 100.0
        open_circuit_v = 24.5 + 4.2 * soc_factor
        self.battery_voltage = open_circuit_v - (self.battery_current * self.battery_internal_r) + random.uniform(-0.03, 0.03)
        self.bus_voltage = self.battery_voltage - 0.25

        # 4. THERMAL DYNAMICS
        # Internal Joule and electronics heat
        q_internal = self.power_consumption * 0.88 + (self.battery_current ** 2) * self.battery_internal_r * 8.0
        # External solar thermal absorption
        q_solar_in = (self.solar_power * 0.35) if in_sun else 15.0
        
        # Radiator cooling
        cooling_eff = overrides.get("cooling_efficiency", 100.0)
        self.cooling_efficiency = max(5.0, min(100.0, cooling_eff))
        
        sigma = 5.670374e-8
        epsilon = 0.88
        rad_area = 2.4
        t_kelvin = self.temperature + 273.15
        q_radiator = epsilon * sigma * rad_area * (t_kelvin**4 - self.ambient_space_temp**4) * (self.cooling_efficiency / 100.0)
        
        # Net thermal rate
        net_heat_flow = (q_internal + q_solar_in) - q_radiator
        # Ambient temperature update with thermal inertia
        dT = (net_heat_flow / self.thermal_capacity) * dt
        self.temperature = max(-30.0, min(95.0, self.temperature + dT + random.uniform(-0.02, 0.02)))
        
        # Coupled subsystem temperatures
        self.radiator_temp = -22.0 + (self.temperature * 0.25) * (self.cooling_efficiency / 100.0) + random.uniform(-0.1, 0.1)
        self.battery_temperature = self.temperature - 2.8 + (self.battery_current * 0.35) * battery_degradation_mult + random.uniform(-0.04, 0.04)
        self.cpu_temp = self.temperature + 16.5 + (self.cpu_load / 100.0) * 14.0 + random.uniform(-0.1, 0.1)

        # 5. PROPULSION DYNAMICS
        fuel_leak_rate = overrides.get("fuel_leak_rate", 0.0)
        self.fuel_mass_percent = max(0.0, self.fuel_mass_percent - (0.0001 + fuel_leak_rate) * dt)
        
        # Tank pressure obeys ideal gas proportional to mass and temperature
        temp_ratio = (self.temperature + 273.15) / 295.15
        mass_ratio = self.fuel_mass_percent / 100.0
        tank_base_p = self.tank_nominal_pressure * mass_ratio * temp_ratio
        
        propulsion_fault = overrides.get("propulsion_fault", False)
        if propulsion_fault:
            self.fuel_pressure = max(40.0, tank_base_p * 0.65 + random.uniform(-1.0, 1.0))
            self.thruster_pressure = max(3.0, 18.5 * 0.45 + random.uniform(-0.4, 0.4))
            self.thruster_temp = self.temperature + 35.0 + random.uniform(-0.5, 0.5)
        else:
            self.fuel_pressure = tank_base_p + random.uniform(-0.3, 0.3)
            self.thruster_pressure = 18.5 * (self.fuel_pressure / self.tank_nominal_pressure) + random.uniform(-0.05, 0.05)
            self.thruster_temp = self.temperature - 4.5 + random.uniform(-0.1, 0.1)

        # 6. COMMUNICATIONS & LINK BUDGET
        pointing_error_override = overrides.get("pointing_error", 0.02)
        self.antenna_pointing_error = pointing_error_override + random.uniform(-0.005, 0.005)
        
        # Higher pointing error degrades link margin
        rf_loss_db = 14.0 * (self.antenna_pointing_error ** 2)
        comm_loss_factor = overrides.get("comm_loss_factor", 0.0)
        
        effective_snr = 29.0 - rf_loss_db - comm_loss_factor * 18.0 + random.uniform(-0.3, 0.3)
        self.snr_db = max(4.0, effective_snr)
        
        # Packet loss is logistic function of SNR
        snr_deficit = max(0.0, 18.0 - self.snr_db)
        if snr_deficit > 0:
            self.packet_loss_pct = min(45.0, 0.1 + math.exp(snr_deficit * 0.45) * 0.2 + random.uniform(-0.2, 0.5))
            self.comm_signal_pct = max(15.0, 95.0 - snr_deficit * 6.0 + random.uniform(-1.0, 1.0))
            self.latency_ms = 115.0 + snr_deficit * 28.0 + random.uniform(-3.0, 5.0)
        else:
            self.packet_loss_pct = max(0.01, 0.05 + random.uniform(-0.02, 0.04))
            self.comm_signal_pct = max(88.0, min(99.0, 95.0 + random.uniform(-1.0, 1.0)))
            self.latency_ms = max(90.0, 115.0 + random.uniform(-2.0, 3.0))

        # 7. ADCS / ATTITUDE
        attitude_jitter = overrides.get("attitude_jitter", 1.0)
        self.roll = 0.02 * math.sin(self.time_seconds * 0.08) * attitude_jitter + random.uniform(-0.005, 0.005)
        self.pitch = -0.01 * math.cos(self.time_seconds * 0.06) * attitude_jitter + random.uniform(-0.005, 0.005)
        self.yaw = 0.03 * math.sin(self.time_seconds * 0.04) * attitude_jitter + random.uniform(-0.005, 0.005)
        self.angular_velocity = max(0.001, (0.004 + 0.002 * attitude_jitter) + random.uniform(-0.0005, 0.0005))
        self.reaction_wheel_rpm = 3200.0 + 120.0 * math.sin(self.time_seconds * 0.1) * attitude_jitter + random.uniform(-5.0, 5.0)

        # 8. SUBSYSTEM HEALTH COMPUTATION
        # Thermal Health
        if self.temperature > 55.0:
            thermal_health = max(10.0, 100.0 - (self.temperature - 55.0) * 3.5)
        elif self.temperature < -15.0:
            thermal_health = max(15.0, 100.0 - (-15.0 - self.temperature) * 3.0)
        else:
            thermal_health = 100.0 - (abs(self.temperature - 22.0) / 33.0) * 8.0
            
        # Battery Health
        bat_temp_penalty = max(0.0, (self.battery_temperature - 35.0) * 2.5)
        bat_soc_penalty = max(0.0, (30.0 - self.battery_soc) * 1.5)
        battery_health = max(15.0, self.battery_health - bat_temp_penalty - bat_soc_penalty)
        
        # Power Health
        power_health = max(15.0, min(100.0, 100.0 - max(0.0, (800.0 - self.solar_power) / 8.0) if in_sun else 96.0))
        
        # Propulsion Health
        p_health = 100.0 if not propulsion_fault else 42.0
        if self.fuel_pressure < 120.0:
            p_health = min(p_health, 35.0)
            
        # Comms Health
        comms_health = max(10.0, min(100.0, self.comm_signal_pct - (self.packet_loss_pct * 3.0)))
        
        # Attitude Health
        adcs_health = max(20.0, min(100.0, 100.0 - (abs(self.roll) + abs(self.pitch) + abs(self.yaw)) * 40.0))
        
        # Overall Weighted Health
        weights = {"power": 0.20, "battery": 0.20, "thermal": 0.20, "propulsion": 0.15, "comm": 0.15, "adcs": 0.10}
        overall = (
            power_health * weights["power"] +
            battery_health * weights["battery"] +
            thermal_health * weights["thermal"] +
            p_health * weights["propulsion"] +
            comms_health * weights["comm"] +
            adcs_health * weights["adcs"]
        )

        return {
            "step": self.step_counter,
            "temperature": round(self.temperature, 2),
            "radiator_temp": round(self.radiator_temp, 2),
            "cooling_efficiency": round(self.cooling_efficiency, 1),
            "battery": round(self.battery_soc, 1),
            "battery_voltage": round(self.battery_voltage, 2),
            "battery_current": round(self.battery_current, 2),
            "battery_temperature": round(self.battery_temperature, 2),
            "battery_health": round(self.battery_health, 1),
            "solar_power": round(self.solar_power, 1),
            "power_consumption": round(self.power_consumption, 1),
            "bus_voltage": round(self.bus_voltage, 2),
            "fuel": round(self.fuel_mass_percent, 1),
            "fuel_pressure": round(self.fuel_pressure, 1),
            "thruster_pressure": round(self.thruster_pressure, 2),
            "thruster_temp": round(self.thruster_temp, 1),
            "communication_signal": round(self.comm_signal_pct, 1),
            "packet_loss": round(self.packet_loss_pct, 2),
            "latency": round(self.latency_ms, 1),
            "snr": round(self.snr_db, 1),
            "roll": round(self.roll, 3),
            "pitch": round(self.pitch, 3),
            "yaw": round(self.yaw, 3),
            "angular_velocity": round(self.angular_velocity, 4),
            "reaction_wheel_rpm": round(self.reaction_wheel_rpm, 1),
            "cpu": round(self.cpu_load, 1),
            "cpu_temp": round(self.cpu_temp, 1),
            "memory_usage": round(self.memory_usage, 1),
            "power_health": round(power_health, 1),
            "thermal_health": round(thermal_health, 1),
            "battery_health_calc": round(battery_health, 1),
            "propulsion_health": round(p_health, 1),
            "communication_health": round(comms_health, 1),
            "attitude_health": round(adcs_health, 1),
            "overall_health": round(overall, 1)
        }
