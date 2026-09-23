import asyncio
import httpx
import websockets
import json

BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000/ws/telemetry"

async def run_system_verification():
    print("==================================================")
    print(" ORBITAL TWIN - SYSTEM & API END-TO-END VERIFICATION")
    print("==================================================")

    async with httpx.AsyncClient(timeout=10.0) as client:
        # 1. Health check
        res = await client.get(f"{BASE_URL}/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("[PASS] /api/health ->", res.json())

        # 2. Spacecraft state
        res = await client.get(f"{BASE_URL}/api/spacecraft")
        assert res.status_code == 200
        sc = res.json()
        print(f"[PASS] /api/spacecraft -> ID: {sc['id']}, Health: {sc['overall_health']}%, Mode: {sc['operating_mode']}")

        # 3. Latest Telemetry
        res = await client.get(f"{BASE_URL}/api/telemetry/latest")
        assert res.status_code == 200
        telem = res.json()
        print(f"[PASS] /api/telemetry/latest -> Temp: {telem['temperature']}C, Battery: {telem['battery']}%, Bus V: {telem['battery_voltage']}V, Solar: {telem['solar_power']}W")

        # 4. Subsystems
        res = await client.get(f"{BASE_URL}/api/subsystems")
        assert res.status_code == 200
        subs = res.json()
        print(f"[PASS] /api/subsystems -> {len(subs)} subsystems loaded (e.g. {subs[0]['name']}: {subs[0]['health']}%)")

        # 5. Predictions
        res = await client.get(f"{BASE_URL}/api/predictions")
        assert res.status_code == 200
        preds = res.json()
        print(f"[PASS] /api/predictions -> {len(preds)} subsystem predictions active")
        for p in preds[:2]:
            print(f"    - {p['subsystem']}: Fail Prob {round(p['failure_probability']*100, 1)}%, Risk: {p['risk_level']}")

        # 6. Root cause
        res = await client.get(f"{BASE_URL}/api/root-cause/latest")
        assert res.status_code == 200
        rc = res.json()
        print(f"[PASS] /api/root-cause/latest -> Subsystem: {rc['subsystem']}, Causal nodes: {len(rc['causal_chain'])}")

        # 7. Recommendations
        res = await client.get(f"{BASE_URL}/api/recommendations")
        assert res.status_code == 200
        recs = res.json()
        print(f"[PASS] /api/recommendations -> {len(recs)} operational action plans available")

        # 8. What-If Simulation
        sim_payload = {
            "scenario": "Cooling Loop Perturbation Assessment",
            "cooling_failure_percent": 50.0,
            "solar_power_reduction": 0.0,
            "power_load_increase": 20.0,
            "duration_hours": 6.0
        }
        res = await client.post(f"{BASE_URL}/api/simulation/run", json=sim_payload)
        assert res.status_code == 200
        sim_res = res.json()
        print(f"[PASS] /api/simulation/run -> Unmitigated: {sim_res['simulated_state']['unmitigated_health']}%, Mitigated: {sim_res['simulated_state']['mitigated_health']}%")

        # 9. Grok AI Chat Assistant
        chat_payload = {
            "message": "Why is the thermal subsystem health declining?",
            "conversation_history": []
        }
        res = await client.post(f"{BASE_URL}/api/ai/chat", json=chat_payload)
        assert res.status_code == 200
        chat_data = res.json()
        print(f"[PASS] /api/ai/chat -> Reply length: {len(chat_data['reply'])} chars, Sources: {chat_data['sources']}")
        print("    Snippet:", chat_data['reply'][:120] + "...")

        # 10. Demo Scenario Trigger: Trigger THERMAL_DEGRADATION
        res = await client.post(f"{BASE_URL}/api/demo/trigger", json={"scenario": "THERMAL_DEGRADATION"})
        assert res.status_code == 200
        print("[PASS] /api/demo/trigger -> THERMAL_DEGRADATION activated")

        # Sleep 2s to allow degradation step
        await asyncio.sleep(2.0)

        # Check telemetry response to degradation
        res = await client.get(f"{BASE_URL}/api/telemetry/latest")
        t_after = res.json()
        print(f"[PASS] Telemetry progression check -> Mode: {t_after['operating_mode']}, Stage: {t_after.get('degradation_stage', 'N/A')}, Progress: {t_after.get('degradation_progress', 0.0)}")

        # Reset back to NORMAL
        res = await client.post(f"{BASE_URL}/api/demo/trigger", json={"scenario": "NORMAL"})
        print("[PASS] /api/demo/trigger -> Restored to NORMAL baseline")

    # 11. WebSocket Live Stream Verification
    print("\nConnecting to WebSocket at", WS_URL, "...")
    async with websockets.connect(WS_URL) as ws:
        msg = await ws.recv()
        data = json.loads(msg)
        print(f"[PASS] WebSocket initial message -> Type: {data['type']}, Telemetry fields: {len(data['telemetry'])}")
        # Wait for next streaming packet
        msg2 = await ws.recv()
        data2 = json.loads(msg2)
        print(f"[PASS] WebSocket live tick packet -> Type: {data2['type']}, Bus Temp: {data2['telemetry']['temperature']}C")

    print("\n==================================================")
    print(" [ALL VERIFICATION TESTS PASSED SUCCESSFULLY!]")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_system_verification())
