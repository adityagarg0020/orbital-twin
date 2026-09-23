# ORBITAL TWIN - DATA DICTIONARY & VARIABLE SPECIFICATION

## 1. Scientific Honesty & Data Principle

> **Scientific Transparency Statement**:
> "NASA SMAP/MSL telemetry is used as a real-world anomaly-detection reference dataset. Additional spacecraft parameters (fuel pressure, battery internal impedance, radiator loop efficiency, RF packet loss) and failure scenarios are generated using a physics-informed simulation layer for this prototype."

ORBITAL TWIN strictly enforces separation between:
1. **NASA-derived benchmark telemetry**: Channels from NASA Soil Moisture Active Passive (SMAP) and Mars Science Laboratory (MSL) rover curiosity.
2. **Physics-informed synthetic telemetry**: Continuous dynamic state variables modeling coupled orbital thermodynamics, electrochemistry, and propulsion.
3. **Simulated failure scenarios**: Controlled multi-stage degradation sequences.
4. **Machine Learning outputs**: Anomaly scores, multi-subsystem failure probabilities, and RUL curves.

---

## 2. NASA SMAP/MSL Telemetry Benchmark (82 Channels)

Dataset location: `spacecraft-digital-twin-data/01_nasa_smap_msl/`
Consists of 82 discrete time-series channels with 25 feature columns (column 0 = raw telemetry signal, columns 1–24 = one-hot commands/contextual indicators), paired with ground-truth labeled anomaly sequences from `labeled_anomalies.csv`.

| Channel Prefix | Spacecraft | Subsystem Domain | Description & Benchmark Role |
| :--- | :--- | :--- | :--- |
| **P-1 to P-15** | SMAP | Power (EPS) | Bus current, solar array current, battery charge shunts. Primary baseline for electrical load variance. |
| **T-1 to T-13** | SMAP | Thermal (TCS) | Heat pipe temperatures, thermal louvers, component temps. Used to train thermal anomaly detection. |
| **E-1 to E-13** | SMAP | Environmental / ECLSS | Radiator return temperatures, loop pressure sensors. Ground-truth for cooling degradation benchmarks. |
| **A-1 to A-9** | SMAP | Attitude & ADCS | Reaction wheel speeds, gyro drift rates, star tracker pointing errors. |
| **S-1 to S-2** | SMAP | System Avionics | System bus integrity and payload interface states. |
| **D-1 to D-16** | SMAP | Data & Instrument | Science payload instrument telemetry and buffer counters. |
| **F-1 to F-8** | SMAP | Flight Software | Flight computer watchdog counters, memory registers, task scheduling delays. |
| **G-1 to G-7** | SMAP | Guidance & Control | Maneuver guidance sensors and thrust vector actuators. |
| **M-1 to M-7** | MSL | Mechanisms / Actuators | Actuator currents, joint motor torques, gearbox temperatures. |
| **C-1 to C-2** | MSL | Communication | Transponder link signals, receiver automatic gain control (AGC). |

---

## 3. Physics-Informed Synthetic Telemetry Channels

For spacecraft parameters not present in the NASA SMAP/MSL dataset, a coupled physics simulation engine computes realistic real-time telemetry:

### Thermal Subsystem (TCS)
- `temperature` (°C): Primary spacecraft avionics bus temperature. Derived from thermal mass heat balance: $C_{th} \frac{dT}{dt} = Q_{internal} + Q_{solar} - Q_{radiator}$. Nominal: 20.0°C to 28.0°C.
- `radiator_temp` (°C): Surface temperature of radiative heat rejection panels. Nominal: -25.0°C to -12.0°C.
- `cooling_efficiency` (%): Operational efficiency of the primary pumped fluid loop. Nominal: 95.0% to 100.0%.

### Electrical Power Subsystem (EPS) & Battery (BMS)
- `solar_power` (W): Generated power from dual GaAs solar array wings. Modulated by orbital sunlit/eclipse phase angle $\theta$: $P_{gen} = A_{array} \cdot F_{solar} \cdot \eta \cdot \cos(\theta)$. Nominal: 1,350W to 1,550W (sunlit), 0W (eclipse).
- `power_consumption` (W): Aggregate power drawn by avionics, payloads, cooling pumps, and transmitters. Nominal: 780W to 860W.
- `battery` (% SoC): Battery State of Charge. Integrated from net power balance ($P_{gen} - P_{draw}$). Nominal: 80.0% to 100.0%.
- `battery_voltage` (V): Regulated 28V bus terminal voltage with internal resistance ($R_{int}$) ohmic sag: $V = V_{oc} - I \cdot R_{int}$. Nominal: 27.8V to 28.6V.
- `battery_current` (A): Charge or discharge current. Nominal: 2.5A to 5.5A.
- `battery_temperature` (°C): Cell internal temperature. Coupled to ambient bus temperature and Joule heating $I^2 R_{int}$. Nominal: 18.0°C to 25.0°C.

### Propulsion Subsystem (RCS)
- `fuel` (%): Remaining monopropellant mass in propellant tank. Depleted by thruster firings. Nominal: 50.0% to 100.0%.
- `fuel_pressure` (bar): Propellant tank pressure. Governed by ideal gas law: $P = P_0 \cdot (m/m_0) \cdot (T/T_0)$. Nominal: 215.0 to 225.0 bar.
- `thruster_pressure` (bar): Regulated thruster manifold chamber pressure. Nominal: 18.0 to 19.2 bar.
- `thruster_temp` (°C): Reaction control thruster nozzle temperature. Nominal: 15.0°C to 25.0°C.

### Telemetry, Tracking & Command (TT&C / RF)
- `communication_signal` (%): RF carrier link quality percentage. Nominal: 90.0% to 98.0%.
- `packet_loss` (%): Network frame error rate. Logistic function of Signal-to-Noise Ratio (SNR) and antenna pointing error. Nominal: < 0.1%.
- `latency` (ms): Downlink propagation and buffering delay. Nominal: 105 to 130 ms.
- `snr` (dB): Signal-to-Noise Ratio calculated from RF link budget. Nominal: 26.0 to 30.0 dB.

### Attitude Determination & Control (ADCS)
- `roll`, `pitch`, `yaw` (deg): 3-Axis body orientation attitude error relative to target nadir frame. Nominal: < ±0.05°.
- `angular_velocity` (deg/s): Body rotation rate. Nominal: < 0.01 deg/s.
- `reaction_wheel_rpm` (RPM): Angular velocity of momentum storage reaction wheels. Nominal: 2,800 to 3,400 RPM.

### Computing & Command & Data Handling (CDH)
- `cpu` (%): Central flight computer processing utilization. Nominal: 30.0% to 45.0%.
- `cpu_temp` (°C): Onboard processor core temperature. Nominal: 38.0°C to 45.0°C.
- `memory_usage` (%): Radiation-hardened RAM memory pool allocation. Nominal: 40.0% to 50.0%.
