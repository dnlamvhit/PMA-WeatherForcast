# Weather App - PM Accelerator Task

## Author
**Lam Ngoc Dao**
Email: [dnlamvhit@gmail.com](mailto:dnlamvhit@gmail.com)

## Project Overview
This is a comprehensive weather application built for the PM Accelerator task. It features a Next.js (React) frontend and a Python FastAPI backend with SQLite for database persistence.

## Features
- **Weather Search**: Get current weather and a 5-day forecast for any location using the free Open-Meteo API.
- **Next.js Frontend**: Responsive, modern, and visually appealing web interface styled with Tailwind CSS.
- **FastAPI Backend**: Robust RESTful APIs for communication with the frontend and database.
- **Data Persistence**: Uses SQLAlchemy and SQLite to store all weather queries.
- **Export Data**: Full support for exporting the database into JSON, XML, CSV, Markdown, and PDF formats.

## Environment Setup
The project is configured to automatically activate the virtual environment when opened in VS Code.

### 🚀 The Quick Way (Recommended)
You can start both the frontend and backend with a single command from the root directory:
```powershell
python run.py
```

### Manual Way (Two Terminals)
If you prefer to see separate logs, you will need two terminals:

#### 1. Backend (FastAPI)
Ensure your `.venv` is active, then run:
```powershell
uvicorn backend.main:app --reload
```
The backend will run on `http://localhost:8000`.

#### 2. Frontend (Next.js)
Open a new terminal, navigate to the `frontend` folder, and run:
```powershell
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:3000`.

## Installation
1. Install Python dependencies:
   ```powershell
   .\.venv\Scripts\pip install -r requirements.txt
   ```
2. Install Node.js dependencies:
   ```powershell
   cd frontend
   npm install
   ```

## About PM Accelerator
PM Accelerator is a premier product management training and career accelerator. [Learn more on LinkedIn](https://www.linkedin.com/company/pm-accelerator).
