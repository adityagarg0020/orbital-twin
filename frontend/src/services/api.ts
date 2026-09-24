import { TelemetryData, SubsystemDetail, AnomalyItem, FailurePredictionItem, RootCauseAnalysisData, Recommendation, RULData, MissionEventItem } from '../types/telemetry';

const API_BASE = '/api';

export const api = {
  async getSpacecraft(): Promise<any> {
    const res = await fetch(`${API_BASE}/spacecraft`);
    if (!res.ok) throw new Error('Failed to fetch spacecraft');
    return res.json();
  },

  async getLatestTelemetry(): Promise<TelemetryData> {
    const res = await fetch(`${API_BASE}/telemetry/latest`);
    if (!res.ok) throw new Error('Failed to fetch latest telemetry');
    return res.json();
  },

  async getTelemetryHistory(points: number = 60): Promise<TelemetryData[]> {
    const res = await fetch(`${API_BASE}/telemetry/history?points=${points}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async getSubsystems(): Promise<SubsystemDetail[]> {
    const res = await fetch(`${API_BASE}/subsystems`);
    if (!res.ok) throw new Error('Failed to fetch subsystems');
    return res.json();
  },

  async getAnomalies(): Promise<AnomalyItem[]> {
    const res = await fetch(`${API_BASE}/anomalies`);
    if (!res.ok) throw new Error('Failed to fetch anomalies');
    return res.json();
  },

  async getPredictions(): Promise<FailurePredictionItem[]> {
    const res = await fetch(`${API_BASE}/predictions`);
    if (!res.ok) throw new Error('Failed to fetch predictions');
    return res.json();
  },

  async getRootCause(): Promise<RootCauseAnalysisData> {
    const res = await fetch(`${API_BASE}/root-cause/latest`);
    if (!res.ok) throw new Error('Failed to fetch root cause');
    return res.json();
  },

  async getRecommendations(): Promise<Recommendation[]> {
    const res = await fetch(`${API_BASE}/recommendations`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  async getRUL(): Promise<RULData> {
    const res = await fetch(`${API_BASE}/rul`);
    if (!res.ok) throw new Error('Failed to fetch RUL');
    return res.json();
  },

  async getTimeline(): Promise<MissionEventItem[]> {
    const res = await fetch(`${API_BASE}/timeline`);
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return res.json();
  },

  async getModelStatus(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/models/status`);
    if (!res.ok) throw new Error('Failed to fetch model status');
    return res.json();
  },

  async getNasaChannels(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/nasa/channels`);
    if (!res.ok) throw new Error('Failed to fetch NASA channels');
    return res.json();
  },

  async getNasaChannelData(chan_id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/nasa/channels/${chan_id}`);
    if (!res.ok) throw new Error(`Failed to fetch NASA channel ${chan_id}`);
    return res.json();
  },

  async triggerScenario(scenario: string): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    return res.json();
  },

  async startSimulation(): Promise<any> {
    return (await fetch(`${API_BASE}/simulation/start`, { method: 'POST' })).json();
  },

  async pauseSimulation(): Promise<any> {
    return (await fetch(`${API_BASE}/simulation/pause`, { method: 'POST' })).json();
  },

  async resetSimulation(): Promise<any> {
    return (await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' })).json();
  },

  async setSpeed(speed: number): Promise<any> {
    return (await fetch(`${API_BASE}/simulation/speed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed })
    })).json();
  },

  async runWhatIf(params: any): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async chat(message: string, history: any[] = []): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversation_history: history })
    });
    return res.json();
  },

  async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch health');
    return res.json();
  },

  async getDataSource(): Promise<any> {
    const res = await fetch(`${API_BASE}/telemetry/data-source`);
    if (!res.ok) throw new Error('Failed to fetch data source');
    return res.json();
  },

  async validateManualData(payload: { csv_content?: string; json_content?: string; column_mapping?: Record<string, string> }): Promise<any> {
    const res = await fetch(`${API_BASE}/telemetry/manual/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Validation request failed' }));
      throw new Error(err.detail || 'Validation request failed');
    }
    return res.json();
  },

  async analyzeManualTelemetry(payload: { raw_point?: any; rows?: any[]; column_mapping?: Record<string, string> }): Promise<any> {
    const res = await fetch(`${API_BASE}/telemetry/manual/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Analysis request failed' }));
      throw new Error(err.detail || 'Analysis request failed');
    }
    return res.json();
  },

  async loadManualIntoTwin(payload: { telemetry: any; anomalies?: any[]; predictions?: any[]; rul?: any; source_name?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/telemetry/manual/load-into-twin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Load into twin failed' }));
      throw new Error(err.detail || 'Load into twin failed');
    }
    return res.json();
  },

  async resetManualDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/telemetry/manual/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  async clearManualData(): Promise<any> {
    const res = await fetch(`${API_BASE}/telemetry/manual/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  }
};
