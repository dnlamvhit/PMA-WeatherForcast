import subprocess
import sys
import os
import time
import signal


def kill_port(port: int):
    """Kill any process currently listening on the given port (Windows)."""
    try:
        # Find PIDs using the port
        result = subprocess.run(
            f"netstat -ano | findstr :{port}",
            shell=True, capture_output=True, text=True
        )
        pids = set()
        for line in result.stdout.splitlines():
            parts = line.split()
            # Format: Proto  LocalAddr  ForeignAddr  State  PID
            # We only want LISTENING lines for the exact port
            if f":{port}" in parts[1] if len(parts) >= 5 else False:
                try:
                    pids.add(int(parts[-1]))
                except ValueError:
                    pass
        for pid in pids:
            if pid > 0:
                subprocess.run(f"taskkill /F /T /PID {pid}", shell=True, capture_output=True)
                print(f"  🔪 Killed stale process on port {port} (PID {pid})")
    except Exception as e:
        print(f"  ⚠ Could not clear port {port}: {e}")


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    venv_python = os.path.join(script_dir, ".venv", "Scripts", "python.exe")

    print("🚀 Starting Weather App (Frontend + Backend)...")

    # Kill any stale servers from previous runs
    print("🧹 Clearing ports 8888 and 3000...")
    kill_port(8888)
    kill_port(3000)
    time.sleep(1)  # brief pause to let OS release ports

    # 1. Start Backend (FastAPI)
    backend_cmd = f'"{venv_python}" -m uvicorn backend.main:app --host 0.0.0.0 --port 8888 --reload'
    print(f"📡 Starting Backend on http://localhost:8888")
    backend_proc = subprocess.Popen(backend_cmd, shell=True, cwd=script_dir)

    # 2. Start Frontend (Next.js)
    frontend_dir = os.path.join(script_dir, "frontend")
    print(f"💻 Starting Frontend on http://localhost:3000")
    frontend_proc = subprocess.Popen("npm run dev", shell=True, cwd=frontend_dir)

    print("\n✅ Both servers are running!")
    print("👉 Frontend: http://localhost:3000")
    print("👉 Backend API: http://localhost:8888")
    print("\nPress Ctrl+C to stop both servers.\n")

    try:
        # Keep the script running while both processes are alive
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("❌ Backend stopped unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("❌ Frontend stopped unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
    finally:
        # Graceful shutdown — kill full process trees on Windows
        print("🧹 Cleaning up processes...")
        subprocess.run(f"taskkill /F /T /PID {backend_proc.pid}", shell=True, capture_output=True)
        subprocess.run(f"taskkill /F /T /PID {frontend_proc.pid}", shell=True, capture_output=True)
        # Also nuke any lingering node/next processes on our ports
        kill_port(3000)
        kill_port(8888)
        print("👋 Goodbye!")


if __name__ == "__main__":
    main()
