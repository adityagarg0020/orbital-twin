import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useTelemetry } from '../../context/TelemetryContext';
import { Maximize2, RotateCcw, Info, Zap, Flame, Battery, Radio, Compass, Rocket } from 'lucide-react';

interface SpacecraftCanvasProps {
  interactive?: boolean;
  compact?: boolean;
  onSelectComponent?: (subsystem: string) => void;
}

export const SpacecraftCanvas: React.FC<SpacecraftCanvasProps> = ({
  interactive = true,
  compact = false,
  onSelectComponent
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { telemetry } = useTelemetry();

  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Mesh references for dynamic material color updates
  const thermalRadiatorMeshRef = useRef<THREE.Mesh | null>(null);
  const solarPanelLeftRef = useRef<THREE.Group | null>(null);
  const solarPanelRightRef = useRef<THREE.Group | null>(null);
  const antennaDishRef = useRef<THREE.Mesh | null>(null);
  const batteryBayRef = useRef<THREE.Mesh | null>(null);
  const thrusterNozzleRef = useRef<THREE.Mesh | null>(null);
  const mainBusRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = null; // transparent to show deep space grid

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(4.5, 2.8, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 14;
    controls.minDistance = 2.2;
    controls.autoRotate = !selectedPart;
    controls.autoRotateSpeed = 0.6;

    // 3. Lighting
    // Ambient space light (subtle blue/cyan)
    const ambientLight = new THREE.AmbientLight(0x0a1930, 1.8);
    scene.add(ambientLight);

    // Sunlight (directional bright white)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(10, 8, 6);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Earth albedo light (soft cyan-blue fill from below)
    const earthAlbedo = new THREE.DirectionalLight(0x00a3ff, 0.8);
    earthAlbedo.position.set(-6, -6, -4);
    scene.add(earthAlbedo);

    // 4. Spacecraft Hierarchical Model
    const spacecraftGroup = new THREE.Group();
    scene.add(spacecraftGroup);

    // A. Main Avionics Bus (Hexagonal or cuboid central body)
    const busGeo = new THREE.BoxGeometry(1.6, 2.2, 1.6);
    const busMat = new THREE.MeshStandardMaterial({
      color: 0x1b2838,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: false
    });
    const mainBus = new THREE.Mesh(busGeo, busMat);
    mainBus.name = 'Main Avionics Bus';
    mainBusRef.current = mainBus;
    spacecraftGroup.add(mainBus);

    // Gold Multi-Layer Insulation (MLI) Foil Accents
    const mliGeo = new THREE.BoxGeometry(1.62, 0.7, 1.62);
    const mliMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.15,
      bumpScale: 0.05
    });
    const mliWrap = new THREE.Mesh(mliGeo, mliMat);
    mliWrap.position.y = -0.3;
    spacecraftGroup.add(mliWrap);

    // B. Dual Deployable Solar Array Wings
    const createSolarWing = (isLeft: boolean) => {
      const wingGroup = new THREE.Group();
      // Yoke bracket
      const yokeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 16);
      const yokeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
      const yoke = new THREE.Mesh(yokeGeo, yokeMat);
      yoke.rotation.z = Math.PI / 2;
      yoke.position.x = isLeft ? -0.35 : 0.35;
      wingGroup.add(yoke);

      // Solar Panel Panels (3 articulated sections)
      for (let i = 0; i < 3; i++) {
        const panelGeo = new THREE.BoxGeometry(0.85, 1.4, 0.04);
        // Front face solar cells (deep navy blue with subtle grid lines)
        const cellMat = new THREE.MeshStandardMaterial({
          color: 0x0f2b5c,
          metalness: 0.8,
          roughness: 0.15,
          emissive: 0x001a33,
          emissiveIntensity: 0.2
        });
        const panel = new THREE.Mesh(panelGeo, cellMat);
        const offsetX = (isLeft ? -1 : 1) * (0.8 + i * 0.92);
        panel.position.set(offsetX, 0, 0);
        panel.name = isLeft ? 'Solar Array Left' : 'Solar Array Right';
        wingGroup.add(panel);

        // Gold frame edge
        const frameGeo = new THREE.BoxGeometry(0.87, 1.42, 0.02);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.3 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.set(offsetX, 0, -0.015);
        wingGroup.add(frame);
      }
      return wingGroup;
    };

    const solarLeft = createSolarWing(true);
    const solarRight = createSolarWing(false);
    solarLeft.position.x = -0.8;
    solarRight.position.x = 0.8;
    solarPanelLeftRef.current = solarLeft;
    solarPanelRightRef.current = solarRight;
    spacecraftGroup.add(solarLeft);
    spacecraftGroup.add(solarRight);

    // C. High-Gain Parabolic Antenna (TT&C Comms)
    const dishGeo = new THREE.SphereGeometry(0.65, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.8);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.3,
      roughness: 0.2,
      side: THREE.DoubleSide
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 1.35, 0.3);
    dish.rotation.x = -Math.PI / 3.5;
    dish.name = 'High-Gain Antenna';
    antennaDishRef.current = dish;
    spacecraftGroup.add(dish);

    // Feed horn feed support
    const feedGeo = new THREE.ConeGeometry(0.08, 0.25, 16);
    const feedMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 });
    const feed = new THREE.Mesh(feedGeo, feedMat);
    feed.position.set(0, 1.6, 0.65);
    feed.rotation.x = Math.PI / 1.5;
    spacecraftGroup.add(feed);

    // D. Thermal Radiator Panels (on sides)
    const radGeo = new THREE.BoxGeometry(0.06, 1.2, 1.3);
    const radMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      metalness: 0.5,
      roughness: 0.2,
      emissive: 0x003344,
      emissiveIntensity: 0.4
    });
    const radiator = new THREE.Mesh(radGeo, radMat);
    radiator.position.set(0.83, 0.3, 0);
    radiator.name = 'Thermal Radiator Panel';
    thermalRadiatorMeshRef.current = radiator;
    spacecraftGroup.add(radiator);

    // Second radiator panel on opposite side
    const radOpposite = new THREE.Mesh(radGeo, radMat.clone());
    radOpposite.position.set(-0.83, 0.3, 0);
    radOpposite.name = 'Thermal Radiator Panel';
    spacecraftGroup.add(radOpposite);

    // E. Propulsion Module (Bottom engine nozzle & RCS clusters)
    const nozzleGeo = new THREE.ConeGeometry(0.38, 0.7, 32, 1, true);
    const nozzleMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.95,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    const mainEngine = new THREE.Mesh(nozzleGeo, nozzleMat);
    mainEngine.position.set(0, -1.45, 0);
    mainEngine.rotation.x = Math.PI;
    mainEngine.name = 'Propulsion Thruster';
    thrusterNozzleRef.current = mainEngine;
    spacecraftGroup.add(mainEngine);

    // 4 Corner RCS thruster blocks
    const rcsPositions = [
      [0.8, -1.1, 0.8],
      [-0.8, -1.1, 0.8],
      [0.8, -1.1, -0.8],
      [-0.8, -1.1, -0.8]
    ];
    rcsPositions.forEach(([x, y, z]) => {
      const rcsGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      const rcsMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
      const rcsBlock = new THREE.Mesh(rcsGeo, rcsMat);
      rcsBlock.position.set(x, y, z);
      spacecraftGroup.add(rcsBlock);
    });

    // F. Battery Bay (lower deck indicator)
    const batGeo = new THREE.BoxGeometry(0.9, 0.35, 1.2);
    const batMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0x047857,
      emissiveIntensity: 0.3
    });
    const batBay = new THREE.Mesh(batGeo, batMat);
    batBay.position.set(0, -0.85, 0);
    batBay.name = 'Battery Power Module';
    batteryBayRef.current = batBay;
    spacecraftGroup.add(batBay);

    // Attitude Wheel Gyro Ring (visible technical ring)
    const ringGeo = new THREE.TorusGeometry(0.9, 0.02, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    spacecraftGroup.add(ring);

    // 5. Raycasting for Component Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(spacecraftGroup.children, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.name && hitObj.parent !== spacecraftGroup) {
          hitObj = hitObj.parent;
        }
        const name = hitObj?.name || 'Spacecraft Component';
        setSelectedPart(name);

        // Map to subsystem
        if (onSelectComponent) {
          if (name.includes('Thermal')) onSelectComponent('Thermal');
          else if (name.includes('Solar')) onSelectComponent('Power');
          else if (name.includes('Battery')) onSelectComponent('Battery');
          else if (name.includes('Antenna')) onSelectComponent('Communication');
          else if (name.includes('Thruster') || name.includes('Propulsion')) onSelectComponent('Propulsion');
          else onSelectComponent('General');
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // 6. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Subtle orbital pitch & solar panel oscillation
      if (solarPanelLeftRef.current && solarPanelRightRef.current) {
        solarPanelLeftRef.current.rotation.x = Math.sin(elapsed * 0.5) * 0.02;
        solarPanelRightRef.current.rotation.x = Math.sin(elapsed * 0.5) * 0.02;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      controls.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [interactive]);

  // Dynamic visual highlighting based on live telemetry health state!
  useEffect(() => {
    if (!telemetry) return;

    // A. Thermal Radiator status coloring
    if (thermalRadiatorMeshRef.current) {
      const mat = thermalRadiatorMeshRef.current.material as THREE.MeshStandardMaterial;
      const tHealth = telemetry.thermal_health;
      if (tHealth < 60 || telemetry.temperature > 50.0) {
        // Critical Red Warning
        mat.color.setHex(0xef4444);
        mat.emissive.setHex(0xb91c1c);
        mat.emissiveIntensity = 0.8;
      } else if (tHealth < 80 || telemetry.temperature > 32.0) {
        // Amber Warning
        mat.color.setHex(0xf59e0b);
        mat.emissive.setHex(0xb45309);
        mat.emissiveIntensity = 0.5;
      } else {
        // Nominal Cyan/Blue
        mat.color.setHex(0x00f0ff);
        mat.emissive.setHex(0x003344);
        mat.emissiveIntensity = 0.3;
      }
    }

    // B. Battery Bay status coloring
    if (batteryBayRef.current) {
      const mat = batteryBayRef.current.material as THREE.MeshStandardMaterial;
      const bHealth = telemetry.battery_health_calc;
      if (bHealth < 60 || telemetry.battery_voltage < 24.0) {
        mat.color.setHex(0xef4444);
        mat.emissive.setHex(0xb91c1c);
        mat.emissiveIntensity = 0.8;
      } else if (bHealth < 80 || telemetry.battery_voltage < 26.5) {
        mat.color.setHex(0xf59e0b);
        mat.emissive.setHex(0xb45309);
        mat.emissiveIntensity = 0.5;
      } else {
        mat.color.setHex(0x10b981);
        mat.emissive.setHex(0x047857);
        mat.emissiveIntensity = 0.3;
      }
    }

    // C. Thruster coloring
    if (thrusterNozzleRef.current) {
      const mat = thrusterNozzleRef.current.material as THREE.MeshStandardMaterial;
      if (telemetry.propulsion_health < 60) {
        mat.color.setHex(0xef4444);
        mat.emissive.setHex(0x7f1d1d);
        mat.emissiveIntensity = 0.7;
      } else {
        mat.color.setHex(0x1e293b);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0.0;
      }
    }

    // D. Antenna coloring
    if (antennaDishRef.current) {
      const mat = antennaDishRef.current.material as THREE.MeshStandardMaterial;
      if (telemetry.communication_health < 60) {
        mat.color.setHex(0xf87171);
      } else {
        mat.color.setHex(0xf8fafc);
      }
    }
  }, [telemetry]);

  return (
    <div className="relative w-full h-full min-h-[350px] overflow-hidden rounded bg-[#040813] border border-[#16243f]">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Overlay: Technical Reticle & Corner Accents */}
      <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="font-mono text-[11px] text-cyan-400 bg-black/60 px-2 py-1 rounded border border-cyan-800/40 backdrop-blur-sm">
            <span className="font-bold">CAD:</span> SPACECRAFT-01 DIGITAL TWIN
            <div className="text-[10px] text-slate-400">STATUS: {telemetry?.operating_mode || 'NOMINAL'}</div>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-black/50 px-2 py-1 rounded">
            <span>ROTATION: 360° ORBIT</span>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="font-mono text-[10px] text-slate-500 bg-black/40 px-2 py-0.5 rounded">
            CLICK COMPONENT TO INSPECT
          </div>
          {telemetry && (
            <div className="font-mono text-xs text-right bg-black/60 px-2.5 py-1.5 rounded border border-[#16243f]">
              <div className="text-slate-400 text-[10px]">CURRENT BUS TEMP</div>
              <div className={`font-bold ${telemetry.temperature > 40 ? 'text-rose-400' : 'text-cyan-300'}`}>
                {telemetry.temperature}°C
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Component Inspector Modal Card */}
      {selectedPart && (
        <div className="absolute top-12 left-4 z-20 w-72 bg-[#060e20]/95 border border-cyan-500/50 rounded shadow-2xl p-3 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2 mb-2">
            <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-xs font-bold">
              <Info className="w-4 h-4 text-cyan-400" />
              {selectedPart.toUpperCase()}
            </div>
            <button
              onClick={() => setSelectedPart(null)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
            {selectedPart.includes('Thermal') && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Radiator Temp:</span>
                  <span className="font-bold text-cyan-300">{telemetry?.radiator_temp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cooling Health:</span>
                  <span className={`font-bold ${telemetry && telemetry.cooling_efficiency < 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {telemetry?.cooling_efficiency}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Rejects electronics and internal Joule heat via radiative emission.
                </div>
              </>
            )}

            {selectedPart.includes('Solar') && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Array Generation:</span>
                  <span className="font-bold text-cyan-300">{telemetry?.solar_power} W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Array SOH:</span>
                  <span className="font-bold text-emerald-400">98.5%</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Dual triple-junction GaAs solar arrays powering primary 28V regulated bus.
                </div>
              </>
            )}

            {selectedPart.includes('Battery') && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">State of Charge:</span>
                  <span className="font-bold text-cyan-300">{telemetry?.battery}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bus Voltage:</span>
                  <span className="font-bold text-cyan-300">{telemetry?.battery_voltage} V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cell Temp:</span>
                  <span className="font-bold text-amber-300">{telemetry?.battery_temperature}°C</span>
                </div>
              </>
            )}

            {selectedPart.includes('Antenna') && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Signal Strength:</span>
                  <span className="font-bold text-cyan-300">{telemetry?.communication_signal}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Packet Loss:</span>
                  <span className="font-bold text-rose-300">{telemetry?.packet_loss}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Carrier SNR:</span>
                  <span className="font-bold text-cyan-300">{telemetry?.snr} dB</span>
                </div>
              </>
            )}

            {selectedPart.includes('Thruster') && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fuel Pressure:</span>
                  <span className="font-bold text-cyan-300">{telemetry?.fuel_pressure} bar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chamber Pressure:</span>
                  <span className="font-bold text-cyan-300">{telemetry?.thruster_pressure} bar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Remaining Fuel:</span>
                  <span className="font-bold text-emerald-300">{telemetry?.fuel}%</span>
                </div>
              </>
            )}

            {selectedPart.includes('Main') && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bus Structure:</span>
                  <span className="font-bold text-cyan-300">CFRP Monocoque</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Overall Health:</span>
                  <span className="font-bold text-emerald-400">{telemetry?.overall_health}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CPU Core Temp:</span>
                  <span className="font-bold text-cyan-300">{telemetry?.cpu_temp}°C</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
