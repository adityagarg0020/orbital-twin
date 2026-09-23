# ORBITAL TWIN - MACHINE LEARNING PIPELINE DOCUMENTATION

## 1. Overview of Machine Learning Architecture

The ORBITAL TWIN platform implements a layered Machine Learning architecture designed for aerospace operations:
1. **Unsupervised Anomaly Detection**: Rapidly flags subtle out-of-distribution deviations across streaming multi-channel telemetry using an Isolation Forest trained on the NASA SMAP/MSL benchmark dataset.
2. **Supervised Failure Prediction**: Forecasts subsystem degradation trajectories and quantifies failure risk probabilities using multi-output XGBoost models trained with chronologically segmented time-series data.
3. **Statistical RUL Estimation**: Projects Remaining Useful Life with non-linear degradation kinetics and expanding 95% confidence intervals.
4. **Root Cause & Explainability**: Calculates feature attribution weights (SHAP/Gini importance) to trace physical causal chains.

---

## 2. Anomaly Detection Model (Isolation Forest)

- **Algorithm**: `sklearn.ensemble.IsolationForest`
- **Model Artifact**: `models/anomaly/isolation_forest.joblib`
- **Scaler Artifact**: `models/anomaly/scaler.joblib`
- **Input Features (10 Channels)**:
  `temperature`, `battery_voltage`, `battery_current`, `power_consumption`, `solar_power`, `fuel_pressure`, `thruster_pressure`, `communication_signal`, `packet_loss`, `cpu_temp`
- **Hyperparameters**:
  - `n_estimators`: 120
  - `contamination`: 0.03
  - `max_samples`: 'auto'
  - `random_state`: 42
- **Scoring Function**:
  The raw decision function score $s_{raw}$ is mapped to a normalized anomaly score $A \in [0.0, 1.0]$ via a calibrated logistic sigmoid:
  $$A = \frac{1}{1 + \exp((s_{raw} + 0.02) \times 14.0)}$$
- **Severity Thresholds**:
  - `NOMINAL`: $A < 0.52$ and deviant features $< 1$
  - `WARNING`: $0.52 \le A < 0.78$ or deviant features $\ge 1$
  - `CRITICAL`: $A \ge 0.78$ or deviant features $\ge 3$

---

## 3. Supervised Failure Prediction Model (XGBoost)

- **Algorithm**: `xgboost.XGBClassifier` (Gradient Boosted Decision Trees)
- **Model Artifact**: `models/failure/xgboost_failure.joblib`
- **Subsystem Classifiers**: 6 independent binary classification heads:
  1. `Thermal`
  2. `Battery`
  3. `Power`
  4. `Propulsion`
  5. `Communication`
  6. `Attitude`
- **Input Features (16 Parameters)**:
  - Instantaneous values: temperature, cooling efficiency, battery SoC, voltage, current, battery temp, solar power, consumption, fuel pressure, thruster pressure, signal strength, packet loss, pointing jitter, CPU load, CPU temp.
  - Engineered time-window feature: `temp_trend` (rolling slope over previous 5 time steps: $\frac{\Delta T}{\Delta t}$).
- **Time-Series Safety Against Data Leakage**:
  - Random k-fold cross-validation is strictly avoided.
  - Datasets are partitioned chronologically: the first 80% represents historical nominal and early degradation, while the final 20% unseen test horizon represents late-stage degradation and critical failure events.
- **Risk Classification**:
  - `LOW`: $P(Failure) < 0.30$
  - `MODERATE`: $0.30 \le P(Failure) < 0.60$
  - `HIGH`: $0.60 \le P(Failure) < 0.80$
  - `CRITICAL`: $P(Failure) \ge 0.80$

---

## 4. Remaining Useful Life (RUL) Modeling

- **Kinetics**: Life-limiting components (Battery cells, radiator fluid loops, propellant valves) obey thermal-stress accelerated aging:
  $$RUL(t) = RUL_{nominal} \cdot \exp\left(-\frac{E_a}{k_B} \cdot \left(\frac{1}{T_{cell}} - \frac{1}{T_{nom}}\right)\right)$$
- **Uncertainty Bounds**:
  Because future orbital operating conditions possess inherent stochasticity, RUL is delivered with expanding upper and lower 95% confidence intervals:
  $$\sigma(t) = \sigma_0 + \beta \cdot t_{future}$$
