import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useTelemetry } from '../context/TelemetryContext';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  Trash2,
  Cpu,
  Layers,
  ArrowRight,
  TrendingDown,
  Activity,
  Flame,
  Battery,
  Rocket,
  Radio,
  Sliders,
  Database,
  RefreshCw,
  Box
} from 'lucide-react';

interface ValidationResult {
  is_valid: boolean;
  row_count: number;
  column_count: number;
  detected_columns: string[];
  mapped_columns: Record<string, string>;
  missing_values_count: number;
  missing_percentage: number;
  invalid_values_count: number;
  data_types: Record<string, string>;
  preview_rows: Record<string, any>[];
  errors: string[];
  warnings: string[];
  time_range: string;
  status: string;
}

interface AnalysisResult {
  telemetry: Record<string, any>;
  anomaly_detection: {
    anomaly_score: number;
    anomaly_detected: boolean;
    severity: 'NOMINAL' | 'WARNING' | 'CRITICAL';
    subsystem: string;
    deviant_features: Array<{
      parameter: string;
      current_value: number;
      baseline_mean: number;
      z_score: number;
      percentage_delta: number;
    }>;
  };
  failure_predictions: Array<{
    subsystem: string;
    failure_probability: number;
    risk_level: string;
    predicted_issue: string;
    time_window: string;
    confidence: number;
  }>;
  subsystem_health: Record<string, number>;
  root_cause: {
    subsystem: string;
    overall_health: number;
    highest_failure_probability: number;
    evidence: any[];
    causal_chain: any[];
  };
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    action_type: string;
    simulated_effect: string;
  }>;
  rul: any;
  summary: string;
}

const TARGET_FIELDS = [
  'timestamp',
  'temperature',
  'battery',
  'voltage',
  'current',
  'fuel',
  'fuel_pressure',
  'thruster_pressure',
  'solar_power',
  'communication_signal',
  'packet_loss',
  'attitude',
  'CPU',
  'thermal_health',
  'battery_health',
  'propulsion_health',
  'failure_type',
  'RUL',
  'anomaly'
];

// Helper to construct sample datasets with both structured rows, CSV, and JSON
function buildSample(label: string, icon: any, description: string, rows: Record<string, any>[]) {
  const headers = Object.keys(rows[0]).join(',');
  const csv = [headers, ...rows.map((r) => Object.values(r).join(','))].join('\n');
  const json = JSON.stringify(rows, null, 2);
  return { label, icon, description, rows, csv, json };
}

// Sample Datasets for Quick Demo Testing (Built-In Flight Profiles)
const SAMPLE_DATASETS: Record<
  string,
  {
    label: string;
    icon: any;
    description: string;
    rows: Record<string, any>[];
    csv: string;
    json: string;
  }
> = {
  NORMAL: buildSample(
    'NORMAL',
    Activity,
    'Nominal telemetry with all subsystems operating within standard envelopes.',
    [
      { timestamp: '2026-09-23T19:56:00', temperature: 24.2, battery: 94, voltage: 28.3, current: 4.1, fuel: 86, fuel_pressure: 221, thruster_pressure: 18.5, solar_power: 1460, communication_signal: 95, packet_loss: 0.04, attitude: 0.01, CPU: 40 },
      { timestamp: '2026-09-23T19:57:00', temperature: 24.3, battery: 93, voltage: 28.2, current: 4.2, fuel: 86, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1455, communication_signal: 94, packet_loss: 0.04, attitude: 0.02, CPU: 41 },
      { timestamp: '2026-09-23T19:58:00', temperature: 24.4, battery: 93, voltage: 28.2, current: 4.1, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1450, communication_signal: 95, packet_loss: 0.05, attitude: 0.01, CPU: 42 },
      { timestamp: '2026-09-23T19:59:00', temperature: 24.5, battery: 92, voltage: 28.2, current: 4.3, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1450, communication_signal: 94, packet_loss: 0.05, attitude: 0.02, CPU: 42 },
      { timestamp: '2026-09-23T20:00:00', temperature: 24.5, battery: 92, voltage: 28.2, current: 4.2, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1450, communication_signal: 94, packet_loss: 0.05, attitude: 0.02, CPU: 42 }
    ]
  ),
  THERMAL: buildSample(
    'THERMAL DEGRADATION',
    Flame,
    'Radiator loop failure causing extreme core temperatures and power surge.',
    [
      { timestamp: '2026-09-23T19:56:00', temperature: 25.0, battery: 91, voltage: 28.1, current: 4.5, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1440, communication_signal: 94, packet_loss: 0.05, attitude: 0.02, CPU: 45 },
      { timestamp: '2026-09-23T19:57:00', temperature: 32.4, battery: 88, voltage: 27.9, current: 5.4, fuel: 84, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1435, communication_signal: 93, packet_loss: 0.12, attitude: 0.03, CPU: 52 },
      { timestamp: '2026-09-23T19:58:00', temperature: 41.8, battery: 84, voltage: 27.5, current: 6.6, fuel: 84, fuel_pressure: 219, thruster_pressure: 18.4, solar_power: 1425, communication_signal: 91, packet_loss: 0.35, attitude: 0.04, CPU: 61 },
      { timestamp: '2026-09-23T19:59:00', temperature: 50.6, battery: 79, voltage: 27.1, current: 7.8, fuel: 83, fuel_pressure: 219, thruster_pressure: 18.4, solar_power: 1415, communication_signal: 89, packet_loss: 0.78, attitude: 0.06, CPU: 69 },
      { timestamp: '2026-09-23T20:00:00', temperature: 58.4, battery: 74, voltage: 26.8, current: 8.9, fuel: 82, fuel_pressure: 218, thruster_pressure: 18.4, solar_power: 1410, communication_signal: 88, packet_loss: 1.20, attitude: 0.08, CPU: 74 }
    ]
  ),
  BATTERY: buildSample(
    'BATTERY DEGRADATION',
    Battery,
    'Internal cell impedance spike with severe voltage droop and fast drain.',
    [
      { timestamp: '2026-09-23T19:56:00', temperature: 26.0, battery: 75, voltage: 27.2, current: 6.2, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1420, communication_signal: 94, packet_loss: 0.05, attitude: 0.02, CPU: 42 },
      { timestamp: '2026-09-23T19:57:00', temperature: 27.5, battery: 68, voltage: 26.4, current: 7.8, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1410, communication_signal: 93, packet_loss: 0.06, attitude: 0.02, CPU: 43 },
      { timestamp: '2026-09-23T19:58:00', temperature: 29.1, battery: 61, voltage: 25.6, current: 9.4, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1405, communication_signal: 92, packet_loss: 0.07, attitude: 0.02, CPU: 44 },
      { timestamp: '2026-09-23T19:59:00', temperature: 30.8, battery: 54, voltage: 24.8, current: 11.0, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1395, communication_signal: 91, packet_loss: 0.08, attitude: 0.02, CPU: 44 },
      { timestamp: '2026-09-23T20:00:00', temperature: 32.1, battery: 48, voltage: 24.1, current: 12.4, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1390, communication_signal: 90, packet_loss: 0.10, attitude: 0.02, CPU: 45 }
    ]
  ),
  PROPULSION: buildSample(
    'PROPULSION ANOMALY',
    Rocket,
    'Propellant manifold leak causing anomalous pressure collapse.',
    [
      { timestamp: '2026-09-23T19:56:00', temperature: 24.5, battery: 91, voltage: 28.2, current: 4.3, fuel: 82, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1445, communication_signal: 94, packet_loss: 0.05, attitude: 0.03, CPU: 44 },
      { timestamp: '2026-09-23T19:57:00', temperature: 24.5, battery: 91, voltage: 28.2, current: 4.4, fuel: 75, fuel_pressure: 198, thruster_pressure: 16.2, solar_power: 1445, communication_signal: 93, packet_loss: 0.06, attitude: 0.11, CPU: 45 },
      { timestamp: '2026-09-23T19:58:00', temperature: 24.6, battery: 90, voltage: 28.1, current: 4.4, fuel: 67, fuel_pressure: 175, thruster_pressure: 13.4, solar_power: 1440, communication_signal: 93, packet_loss: 0.07, attitude: 0.22, CPU: 46 },
      { timestamp: '2026-09-23T19:59:00', temperature: 24.7, battery: 90, voltage: 28.1, current: 4.5, fuel: 59, fuel_pressure: 152, thruster_pressure: 10.6, solar_power: 1440, communication_signal: 92, packet_loss: 0.07, attitude: 0.34, CPU: 47 },
      { timestamp: '2026-09-23T20:00:00', temperature: 24.8, battery: 90, voltage: 28.1, current: 4.5, fuel: 52, fuel_pressure: 135, thruster_pressure: 8.2, solar_power: 1440, communication_signal: 92, packet_loss: 0.08, attitude: 0.45, CPU: 48 }
    ]
  ),
  COMMS: buildSample(
    'COMMUNICATION ANOMALY',
    Radio,
    'High gain antenna RF degradation with severe packet drops and signal attenuation.',
    [
      { timestamp: '2026-09-23T19:56:00', temperature: 24.6, battery: 91, voltage: 28.1, current: 4.4, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1440, communication_signal: 92, packet_loss: 0.08, attitude: 0.02, CPU: 45 },
      { timestamp: '2026-09-23T19:57:00', temperature: 24.8, battery: 90, voltage: 28.1, current: 4.5, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1435, communication_signal: 79, packet_loss: 2.40, attitude: 0.05, CPU: 48 },
      { timestamp: '2026-09-23T19:58:00', temperature: 24.9, battery: 90, voltage: 28.0, current: 4.5, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1435, communication_signal: 64, packet_loss: 6.80, attitude: 0.08, CPU: 51 },
      { timestamp: '2026-09-23T19:59:00', temperature: 25.0, battery: 89, voltage: 28.0, current: 4.6, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1430, communication_signal: 49, packet_loss: 12.40, attitude: 0.10, CPU: 53 },
      { timestamp: '2026-09-23T20:00:00', temperature: 25.1, battery: 89, voltage: 28.0, current: 4.6, fuel: 85, fuel_pressure: 220, thruster_pressure: 18.5, solar_power: 1430, communication_signal: 38, packet_loss: 18.50, attitude: 0.12, CPU: 55 }
    ]
  ),
  MULTIPLE: buildSample(
    'MULTIPLE FAILURE',
    AlertTriangle,
    'Cascading thermal, power, and propulsion multi-subsystem emergency.',
    [
      { timestamp: '2026-09-23T19:56:00', temperature: 29.5, battery: 78, voltage: 27.5, current: 6.8, fuel: 76, fuel_pressure: 210, thruster_pressure: 17.2, solar_power: 1380, communication_signal: 88, packet_loss: 0.50, attitude: 0.15, CPU: 58 },
      { timestamp: '2026-09-23T19:57:00', temperature: 38.2, battery: 69, voltage: 26.6, current: 8.9, fuel: 69, fuel_pressure: 185, thruster_pressure: 14.5, solar_power: 1240, communication_signal: 78, packet_loss: 1.80, attitude: 0.45, CPU: 66 },
      { timestamp: '2026-09-23T19:58:00', temperature: 47.0, battery: 59, voltage: 25.5, current: 10.8, fuel: 62, fuel_pressure: 160, thruster_pressure: 11.8, solar_power: 1100, communication_signal: 69, packet_loss: 3.60, attitude: 0.88, CPU: 74 },
      { timestamp: '2026-09-23T19:59:00', temperature: 55.8, battery: 50, voltage: 24.6, current: 12.6, fuel: 55, fuel_pressure: 135, thruster_pressure: 9.4, solar_power: 960, communication_signal: 61, packet_loss: 5.90, attitude: 1.35, CPU: 81 },
      { timestamp: '2026-09-23T20:00:00', temperature: 64.2, battery: 42, voltage: 23.8, current: 14.5, fuel: 48, fuel_pressure: 110, thruster_pressure: 7.1, solar_power: 820, communication_signal: 54, packet_loss: 8.40, attitude: 1.85, CPU: 88 }
    ]
  )
};

export const DataLabPage: React.FC = () => {
  const navigate = useNavigate();
  const { setDataSource } = useTelemetry();

  // Mode Selection: 'CSV' or 'JSON'
  const [activeMode, setActiveMode] = useState<'CSV' | 'JSON'>('CSV');

  // Input States
  const [csvContent, setCsvContent] = useState<string>('');
  const [csvFileName, setCsvFileName] = useState<string>('');
  const [jsonContent, setJsonContent] = useState<string>(SAMPLE_DATASETS.NORMAL.json);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Loading & Processing States
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isLoadingTwin, setIsLoadingTwin] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Results States
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setStatusMessage({ type: 'error', text: 'Please upload a valid .csv file.' });
      return;
    }
    setCsvFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      triggerValidation(text, undefined);
    };
    reader.readAsText(file);
  };

  // Trigger Backend Validation
  const triggerValidation = async (csv?: string, json?: string, customMapping?: Record<string, string>) => {
    setIsValidating(true);
    setStatusMessage(null);
    try {
      const res = await api.validateManualData({
        csv_content: csv ?? (activeMode === 'CSV' ? csvContent : undefined),
        json_content: json ?? (activeMode === 'JSON' ? jsonContent : undefined),
        column_mapping: customMapping || columnMapping
      });
      setValidationResult(res);
      setColumnMapping(res.mapped_columns || {});
      if (res.is_valid) {
        setStatusMessage({
          type: 'success',
          text: `Validation Successful! ${res.row_count} rows, ${res.column_count} columns verified.`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `Validation Failed: ${res.errors.length} physical limits or type violations found.`
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Validation request failed' });
    } finally {
      setIsValidating(false);
    }
  };

  // Run Backend Pipeline Analysis
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setStatusMessage(null);
    try {
      let payload: any = {};
      if (activeMode === 'JSON') {
        const parsed = JSON.parse(jsonContent);
        payload = Array.isArray(parsed) ? { rows: parsed } : { raw_point: parsed };
      } else {
        if (!validationResult || !validationResult.preview_rows.length) {
          throw new Error('Please validate CSV data before analysis.');
        }
        payload = {
          rows: validationResult.preview_rows,
          column_mapping: columnMapping
        };
      }

      const res = await api.analyzeManualTelemetry(payload);
      setAnalysisResult(res);
      setStatusMessage({
        type: 'success',
        text: 'Analysis Complete! Isolation Forest & XGBoost pipeline executed successfully.'
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Analysis failed.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load analyzed state into Digital Twin & broadcast live over WebSocket
  const handleLoadIntoTwin = async () => {
    if (!analysisResult) return;
    setIsLoadingTwin(true);
    try {
      await api.loadManualIntoTwin({
        telemetry: analysisResult.telemetry,
        anomalies: analysisResult.anomaly_detection.anomaly_detected
          ? [
              {
                id: 999,
                timestamp: analysisResult.telemetry.timestamp || new Date().toISOString(),
                subsystem: analysisResult.anomaly_detection.subsystem,
                channel: 'M-01',
                score: analysisResult.anomaly_detection.anomaly_score,
                severity: analysisResult.anomaly_detection.severity,
                affected_parameters: analysisResult.anomaly_detection.deviant_features.map((f) => f.parameter),
                description: `Manual telemetry anomaly: ${analysisResult.anomaly_detection.subsystem} deviation.`,
                is_nasa_benchmark: false,
                status: 'ACTIVE'
              }
            ]
          : [],
        predictions: analysisResult.failure_predictions,
        rul: analysisResult.rul,
        source_name: 'UPLOADED DATA'
      });
      setDataSource('UPLOADED DATA');
      setStatusMessage({
        type: 'success',
        text: 'Telemetry loaded into Digital Twin! All Mission Control pages and 3D Model updated live.'
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to load into Digital Twin.' });
    } finally {
      setIsLoadingTwin(false);
    }
  };

  // Reset to original simulation environment
  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await api.resetManualDemo();
      setDataSource('SIMULATION');
      setAnalysisResult(null);
      setStatusMessage({
        type: 'info',
        text: 'Digital Twin restored to nominal simulation environment.'
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Reset failed.' });
    } finally {
      setIsResetting(false);
    }
  };

  // Clear uploaded data
  const handleClearData = async () => {
    if (window.confirm('Clear all uploaded telemetry data and restore default state?')) {
      setCsvContent('');
      setCsvFileName('');
      setJsonContent(SAMPLE_DATASETS.NORMAL.json);
      setValidationResult(null);
      setAnalysisResult(null);
      await api.clearManualData();
      setDataSource('SIMULATION');
      setStatusMessage({ type: 'info', text: 'Uploaded data cleared.' });
    }
  };

  // Load a sample preset
  const handleLoadPreset = async (key: string) => {
    const preset = SAMPLE_DATASETS[key];
    if (!preset) return;
    
    setJsonContent(preset.json);
    setCsvContent(preset.csv);
    setCsvFileName(`${key.toLowerCase()}_sample_profile.csv`);
    
    setIsValidating(true);
    setStatusMessage(null);
    try {
      // 1. Validate sample dataset
      const res = await api.validateManualData({
        csv_content: activeMode === 'CSV' ? preset.csv : undefined,
        json_content: activeMode === 'JSON' ? preset.json : undefined
      });
      setValidationResult(res);
      setColumnMapping(res.mapped_columns || {});

      // 2. Automatically execute ML pipeline analysis on the validated preset
      setIsAnalyzing(true);
      const anaRes = await api.analyzeManualTelemetry({
        rows: preset.rows,
        column_mapping: res.mapped_columns || {}
      });
      setAnalysisResult(anaRes);

      setStatusMessage({
        type: 'success',
        text: `Loaded & Analyzed: ${preset.label} (${res.row_count} records). ML Pipeline executed.`
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to load sample dataset.' });
    } finally {
      setIsValidating(false);
      setIsAnalyzing(false);
    }
  };

  // Change mapping
  const handleMappingChange = (col: string, target: string) => {
    const updated = { ...columnMapping, [col]: target };
    setColumnMapping(updated);
    if (activeMode === 'CSV' && csvContent) {
      triggerValidation(csvContent, undefined, updated);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto text-slate-100">
      {/* Page Title & Mission Control Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#16243f]/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 telemetry-mono text-xs mb-1 font-hud uppercase tracking-widest font-bold">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>MISSION CONTROL // TELEMETRY VALIDATION & INGESTION</span>
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-white flex items-center gap-2.5">
            TELEMETRY DATA LAB
          </h1>
          <p className="text-xs text-slate-400 telemetry-mono mt-0.5">
            Manually ingest CSV datasets or JSON telemetry records into the unified Isolation Forest & XGBoost digital-twin pipeline.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b172a] hover:bg-[#12233f] border border-cyan-800/40 text-cyan-300 text-xs font-hud font-bold tracking-wider uppercase transition-all shadow-sm cursor-pointer"
            title="Restore default continuous simulation"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>RESET TO DEMO DATA</span>
          </button>

          <button
            onClick={handleClearData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1c0d12] hover:bg-[#2d121b] border border-rose-800/40 text-rose-300 text-xs font-hud font-bold tracking-wider uppercase transition-all shadow-sm cursor-pointer"
            title="Clear uploaded dataset"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR UPLOADED DATA</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Preset Scenario Selector Buttons (Prompt Section 23) */}
      <div className="bg-[#070e1c] border border-[#16243f] rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
              BUILT-IN TEST SAMPLES
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Click to load representative flight profiles
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(SAMPLE_DATASETS).map(([key, item]) => {
            const Icon = item.icon;
            return (
              <button
                key={key}
                onClick={() => handleLoadPreset(key)}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-[#091427] hover:bg-[#10223f] border border-[#162947] hover:border-cyan-500/50 transition-all text-center group"
              >
                <Icon className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-mono font-bold text-slate-200 group-hover:text-cyan-300">
                  LOAD {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual Mode Switcher: CSV vs JSON */}
      <div className="flex items-center gap-2 border-b border-[#16243f] pb-2">
        <button
          onClick={() => setActiveMode('CSV')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-mono text-xs font-bold transition-all ${
            activeMode === 'CSV'
              ? 'bg-[#0f1d38] text-cyan-300 border-t-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#071122]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>MODE 1: CSV UPLOAD</span>
        </button>

        <button
          onClick={() => setActiveMode('JSON')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-mono text-xs font-bold transition-all ${
            activeMode === 'JSON'
              ? 'bg-[#0f1d38] text-cyan-300 border-t-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#071122]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>MODE 2: MANUAL JSON INPUT</span>
        </button>
      </div>

      {/* Mode 1: CSV Upload Interface */}
      {activeMode === 'CSV' && (
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/20'
                : 'border-[#1b2f54] hover:border-cyan-500/50 bg-[#050d1a]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
              accept=".csv,.txt"
              className="hidden"
            />
            <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-bounce" />
            <h3 className="font-mono text-sm font-bold text-slate-200 mb-1">
              {csvFileName || 'DRAG & DROP CSV TELEMETRY FILE HERE'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Supports raw satellite sensor logs (.csv). Automatically detects columns, checks physical ranges, and maps parameters.
            </p>
          </div>
        </div>
      )}

      {/* Mode 2: Manual JSON Input Interface */}
      {activeMode === 'JSON' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>PASTE OR EDIT RAW TELEMETRY JSON:</span>
            <button
              onClick={() => triggerValidation(undefined, jsonContent)}
              disabled={isValidating}
              className="px-2.5 py-1 rounded bg-[#0b172a] hover:bg-[#13243f] border border-cyan-800/40 text-cyan-300"
            >
              {isValidating ? 'VALIDATING...' : 'VALIDATE JSON'}
            </button>
          </div>
          <textarea
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            rows={10}
            className="w-full bg-[#050a14] border border-[#16243f] rounded-lg p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-inner"
            spellCheck={false}
          />
        </div>
      )}

      {/* Data Quality Panel (Prompt Section 25) */}
      {validationResult && (
        <div className="bg-[#070e1c] border border-[#16243f] rounded-xl p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#16243f] pb-3">
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              DATA QUALITY PANEL
            </h2>
            <div
              className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold border ${
                validationResult.is_valid
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
              }`}
            >
              STATUS: {validationResult.status}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
            <div className="bg-[#040812] p-3 rounded-lg border border-[#14233f]">
              <span className="text-[10px] text-slate-400">ROWS</span>
              <div className="text-lg font-bold text-white">{validationResult.row_count}</div>
            </div>
            <div className="bg-[#040812] p-3 rounded-lg border border-[#14233f]">
              <span className="text-[10px] text-slate-400">COLUMNS</span>
              <div className="text-lg font-bold text-white">{validationResult.column_count}</div>
            </div>
            <div className="bg-[#040812] p-3 rounded-lg border border-[#14233f]">
              <span className="text-[10px] text-slate-400">MISSING VALUES</span>
              <div
                className={`text-lg font-bold ${
                  validationResult.missing_percentage > 5 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {validationResult.missing_percentage}%
              </div>
            </div>
            <div className="bg-[#040812] p-3 rounded-lg border border-[#14233f]">
              <span className="text-[10px] text-slate-400">INVALID VALUES</span>
              <div
                className={`text-lg font-bold ${
                  validationResult.invalid_values_count > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {validationResult.invalid_values_count}
              </div>
            </div>
            <div className="bg-[#040812] p-3 rounded-lg border border-[#14233f] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400">TIME RANGE</span>
              <div className="text-xs font-bold text-cyan-300 truncate" title={validationResult.time_range}>
                {validationResult.time_range}
              </div>
            </div>
          </div>

          {/* Validation Errors list if any */}
          {validationResult.errors.length > 0 && (
            <div className="bg-rose-950/20 border border-rose-500/40 rounded-lg p-3 space-y-1 font-mono text-xs text-rose-300">
              <div className="font-bold flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Validation Violations ({validationResult.errors.length})</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] max-h-36 overflow-y-auto">
                {validationResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Column Mapping Interface (Prompt Section 20) */}
          <div className="space-y-2 pt-2 border-t border-[#16243f]">
            <h3 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              COLUMN MAPPING CONFIGURATION
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 font-mono text-xs">
              {validationResult.detected_columns.map((col) => (
                <div
                  key={col}
                  className="flex items-center justify-between p-2 rounded bg-[#040812] border border-[#16243f] gap-2"
                >
                  <div className="truncate flex-1">
                    <span className="text-slate-300 font-bold">{col}</span>
                    <span className="text-[10px] text-slate-500 ml-1">
                      ({validationResult.data_types[col] || 'string'})
                    </span>
                  </div>
                  <select
                    value={columnMapping[col] || ''}
                    onChange={(e) => handleMappingChange(col, e.target.value)}
                    className="bg-[#0b172a] text-cyan-300 border border-cyan-800/40 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">-- Ignore --</option>
                    {TARGET_FIELDS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview First 20 Rows (Prompt Section 19) */}
          {validationResult.preview_rows.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#16243f]">
              <h3 className="text-xs font-mono font-bold text-slate-300">
                DATA PREVIEW (FIRST {validationResult.preview_rows.length} ROWS)
              </h3>
              <div className="overflow-x-auto max-h-60 rounded border border-[#16243f] bg-[#030712]">
                <table className="w-full text-left font-mono text-[11px] whitespace-nowrap">
                  <thead className="bg-[#081224] text-slate-400 border-b border-[#16243f] sticky top-0">
                    <tr>
                      <th className="p-2">#</th>
                      {validationResult.detected_columns.map((col) => (
                        <th key={col} className="p-2">
                          <span className="text-slate-200">{col}</span>
                          {columnMapping[col] && (
                            <span className="text-[9px] text-cyan-400 block font-normal">
                              → {columnMapping[col]}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#101b33]">
                    {validationResult.preview_rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#071329]">
                        <td className="p-2 text-slate-500">{idx + 1}</td>
                        {validationResult.detected_columns.map((col) => (
                          <td key={col} className="p-2 text-slate-300">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !validationResult.is_valid}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-mono text-xs font-bold transition-all shadow-md ${
                validationResult.is_valid
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'PROCESSING PIPELINE...' : 'ANALYZE TELEMETRY'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results Display (Prompt Section 22, 26, 27) */}
      {analysisResult && (
        <div className="bg-[#060c18] border border-cyan-500/40 rounded-xl p-5 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16243f] pb-3">
            <div>
              <div className="text-[10px] font-mono text-cyan-400">ML PIPELINE RESULTS // ISOLATION FOREST + XGBOOST</div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>TELEMETRY INFERENCE SUMMARY</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    analysisResult.anomaly_detection.severity === 'CRITICAL'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                      : analysisResult.anomaly_detection.severity === 'WARNING'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  }`}
                >
                  {analysisResult.anomaly_detection.severity}
                </span>
              </h2>
            </div>

            {/* Ingestion Button (Prompt Section 26) */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadIntoTwin}
                disabled={isLoadingTwin}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-900/50"
              >
                <Database className={`w-4 h-4 ${isLoadingTwin ? 'animate-spin' : ''}`} />
                <span>LOAD INTO DIGITAL TWIN</span>
              </button>
              <button
                onClick={() => navigate('/mission-control/digital-twin')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0b162a] hover:bg-[#12233f] border border-cyan-700/50 text-cyan-300 font-mono text-xs font-bold transition-colors"
              >
                <Box className="w-3.5 h-3.5" />
                <span>VIEW IN 3D</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#030814] rounded-lg border border-[#14233e] text-xs font-mono text-cyan-200">
            {analysisResult.summary}
          </div>

          {/* Subsystem Health Metrics Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
              DYNAMIC SUBSYSTEM HEALTH SCORES
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-mono">
              {Object.entries(analysisResult.subsystem_health).map(([sub, score]) => (
                <div
                  key={sub}
                  className={`p-2.5 rounded-lg border ${
                    score < 50
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : score < 80
                      ? 'bg-amber-950/30 border-amber-500/40'
                      : 'bg-[#040812] border-[#14233f]'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 block truncate">{sub}</span>
                  <div
                    className={`text-base font-bold ${
                      score < 50 ? 'text-rose-400' : score < 80 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {score}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deviant Features & Root Cause */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Anomaly Detection Details */}
            <div className="bg-[#030712] border border-[#16243f] rounded-lg p-3 space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                <span>ISOLATION FOREST DEVIATIONS</span>
                <span className="text-cyan-400">Score: {analysisResult.anomaly_detection.anomaly_score.toFixed(3)}</span>
              </h4>
              {analysisResult.anomaly_detection.deviant_features.length > 0 ? (
                <div className="space-y-1 max-h-48 overflow-y-auto font-mono text-xs">
                  {analysisResult.anomaly_detection.deviant_features.map((dev, i) => (
                    <div
                      key={i}
                      className="p-1.5 rounded bg-[#070e1c] flex items-center justify-between text-[11px]"
                    >
                      <span className="text-slate-200 font-bold">{dev.parameter}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Val: {dev.current_value}</span>
                        <span className="text-amber-400">Δ {dev.percentage_delta}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-mono text-emerald-400">No anomalous feature deviations detected.</p>
              )}
            </div>

            {/* Failure Predictions */}
            <div className="bg-[#030712] border border-[#16243f] rounded-lg p-3 space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-300">
                XGBOOST FAILURE PROBABILITIES
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
                {analysisResult.failure_predictions.map((pred, i) => (
                  <div
                    key={i}
                    className="p-1.5 rounded bg-[#070e1c] flex items-center justify-between text-[11px]"
                  >
                    <span className="text-slate-200 font-bold">{pred.subsystem}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{pred.predicted_issue}</span>
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          pred.failure_probability > 0.6
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            : pred.failure_probability > 0.3
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-950 text-emerald-300'
                        }`}
                      >
                        {(pred.failure_probability * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations (Prompt Section 15) */}
          {analysisResult.recommendations.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#16243f]">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
                RECOMMENDED CONSIDERATIONS (OPERATOR DECISION SUPPORT)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
                {analysisResult.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-lg bg-[#040812] border border-[#16243f] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">{rec.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{rec.description}</p>
                    <p className="text-[10px] text-emerald-400">Effect: {rec.simulated_effect}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataLabPage;
