# ORBITAL TWIN - REST & WEBSOCKET API SPECIFICATION

## 1. Overview
The ORBITAL TWIN backend exposes clean REST endpoints and a high-frequency WebSocket stream for real-time mission operations.

- **Base URL**: `http://localhost:8000/api`
- **WebSocket URL**: `ws://localhost:8000/ws/telemetry`

---

## 2. REST Endpoints

### 2.1 System & Spacecraft State
- **`GET /api/health`**
  - Returns backend health, simulation tick rate, and active operating mode.
- **`GET /api/spacecraft`**
  - Returns metadata for `SPACECRAFT-01`, mission name, overall health, active anomalies count, and mission elapsed time (MET).

### 2.2 Telemetry
- **`GET /api/telemetry/latest`**
  - Returns the latest telemetry frame containing all 28 physical and health parameters.
- **`GET /api/telemetry/history?points=60`**
  - Returns sliding historical ring buffer (up to 300 points) for time-series charts.

### 2.3 Subsystem Health & Diagnostics
- **`GET /api/subsystems`**
  - Returns multi-subsystem integrity matrix for Power, Battery, Thermal, Propulsion, Communication, and Attitude.

### 2.4 Anomaly Detection
- **`GET /api/anomalies`**
  - Returns active anomalies flagged by the Isolation Forest model with anomaly scores, affected parameters, and NASA benchmark channel IDs.
- **`GET /api/nasa/channels`**
  - Catalog of 82 real NASA SMAP/MSL benchmark channels.
- **`GET /api/nasa/channels/{chan_id}`**
  - Downsampled waveform array and ground-truth anomaly sequence intervals for deep-dive investigation.

### 2.5 Failure Predictions & Root Cause
- **`GET /api/predictions`**
  - Subsystem failure probabilities from supervised XGBoost models, risk classifications (LOW, MODERATE, HIGH, CRITICAL), time windows, and model confidence.
- **`GET /api/root-cause/latest`**
  - Causal graph nodes, empirical telemetry evidence table (current vs nominal delta), and SHAP feature importance attribution.

### 2.6 What-If Counterfactual Simulation
- **`POST /api/simulation/run`**
  - **Payload**:
    ```json
    {
      "scenario": "Cooling Loop Perturbation",
      "cooling_failure_percent": 45.0,
      "solar_power_reduction": 0.0,
      "power_load_increase": 20.0,
      "duration_hours": 6.0
    }
    ```
  - **Response**: Side-by-side comparison (`current_state` vs `simulated_state`), future trajectory array, and recovery feasibility verdict.

### 2.7 Recommendations & Timeline
- **`GET /api/recommendations`**
  - Actionable mitigation recommendations with simulation parameters.
- **`GET /api/timeline`**
  - Dynamic chronological mission log events.
- **`GET /api/models/status`**
  - ML model performance registry (Accuracy, F1-Score, ROC-AUC).

### 2.8 Demo Scenario Triggers
- **`POST /api/demo/trigger`**
  - **Payload**: `{"scenario": "THERMAL_DEGRADATION"}`
  - **Supported Scenarios**: `NORMAL`, `THERMAL_DEGRADATION`, `BATTERY_FAILURE`, `COMMUNICATION_FAILURE`, `PROPULSION_ANOMALY`, `SOLAR_POWER_DROP`.

### 2.9 Grok AI Mission Assistant
- **`POST /api/ai/chat`**
  - **Payload**:
    ```json
    {
      "message": "Why is thermal health declining?",
      "conversation_history": []
    }
    ```
  - **Response**:
    ```json
    {
      "reply": "### Thermal Subsystem Status Analysis...",
      "sources": ["Live Telemetry", "Isolation Forest ML", "XGBoost Predictions"],
      "context_used": { ... }
    }
    ```

---

## 3. WebSocket Real-Time Stream

- **Endpoint**: `/ws/telemetry`
- **Frequency**: 1.0Hz (synchronized with physics tick rate and simulation speed multiplier)
- **Packet Structure**:
  ```json
  {
    "type": "TELEMETRY_UPDATE",
    "telemetry": {
      "timestamp": "2026-09-23T14:35:10Z",
      "temperature": 24.2,
      "battery": 92.1,
      "battery_voltage": 28.25,
      "solar_power": 1452.0,
      "power_consumption": 821.0,
      "overall_health": 95.8,
      "anomaly_score": 0.05,
      "operating_mode": "NORMAL"
    },
    "anomalies": [],
    "predictions": [ ... ],
    "rul": { ... },
    "latest_event": { ... }
  }
  ```
