import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TelemetryProvider } from './context/TelemetryContext';
import { MissionControlLayout } from './components/layout/MissionControlLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { TelemetryPage } from './pages/TelemetryPage';
import { AnomalyDetectionPage } from './pages/AnomalyDetectionPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { SubsystemsPage } from './pages/SubsystemsPage';
import { RootCausePage } from './pages/RootCausePage';
import { WhatIfSimulationPage } from './pages/WhatIfSimulationPage';
import { RULPage } from './pages/RULPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { TimelinePage } from './pages/TimelinePage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ModelStatusPage } from './pages/ModelStatusPage';
import { DataLabPage } from './pages/DataLabPage';

export function App() {
  return (
    <TelemetryProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<LandingPage />} />

          {/* Mission Control Platform */}
          <Route path="/mission-control" element={<MissionControlLayout />}>
            <Route index element={<Navigate to="/mission-control/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="digital-twin" element={<DigitalTwinPage />} />
            <Route path="data-lab" element={<DataLabPage />} />
            <Route path="telemetry" element={<TelemetryPage />} />
            <Route path="anomalies" element={<AnomalyDetectionPage />} />
            <Route path="predictions" element={<PredictionsPage />} />
            <Route path="subsystems" element={<SubsystemsPage />} />
            <Route path="root-cause" element={<RootCausePage />} />
            <Route path="simulation" element={<WhatIfSimulationPage />} />
            <Route path="rul" element={<RULPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="ai-assistant" element={<AIAssistantPage />} />
            <Route path="model-status" element={<ModelStatusPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TelemetryProvider>
  );
}

export default App;
