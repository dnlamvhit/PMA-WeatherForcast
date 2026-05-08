# Weather App - PM Accelerator Task

## Author
**Lam Ngoc Dao**
Email: [dnlamvhit@gmail.com](mailto:dnlamvhit@gmail.com)

## Project Overview
This is a comprehensive weather application built for the PM Accelerator task. It features a Next.js (React) frontend and a Python FastAPI backend with SQLite for database persistence.

## What the App Does

The Weather App is a full-stack application that allows users to:
- **Search for Weather**: Look up current weather conditions and 5-day forecasts for any location worldwide
- **View Detailed Forecasts**: See daily min/max temperatures and detailed weather descriptions
- **Track Weather History**: Automatically stores all weather queries in a persistent SQLite database
- **Export Data**: Export all stored weather records in multiple formats (JSON, XML, CSV, Markdown, PDF)
- **Filter & Query**: Browse all stored weather records and filter by location and date range
- **Real-time Geocoding**: Automatic location lookup using Open-Meteo's geocoding API

## Features
- **Weather Search**: Get current weather and a 5-day forecast for any location using the free Open-Meteo API
- **Next.js Frontend**: Responsive, modern, and visually appealing web interface styled with Tailwind CSS
- **FastAPI Backend**: Robust RESTful APIs for communication with the frontend and database
- **Data Persistence**: Uses SQLAlchemy and SQLite to store all weather queries
- **Export Data**: Full support for exporting weather records in JSON, XML, CSV, Markdown, and PDF formats
- **Weather Descriptions**: Human-readable weather codes (e.g., "Clear sky", "Moderate rain", "Thunderstorm")
- **Temperature Units**: Displays temperatures in both Celsius and Kelvin

## Prerequisites
- Python 3.8+ with virtual environment
- Node.js 16+
- npm or yarn

## Installation

### 1. Clone the repository and set up Python environment:
```powershell
# The virtual environment is auto-configured for VS Code
# Install Python dependencies:
.\.venv\Scripts\pip install -r requirements.txt
```

### 2. Install Node.js dependencies:
```powershell
cd frontend
npm install
cd ..
```

## How to Run the App

### 🚀 The Quick Way (Recommended)
Start both the frontend and backend with a single command from the root directory:
```powershell
python run.py
```
This will:
- Clean up any lingering processes on ports 3000 and 8888
- Start the FastAPI backend on `http://localhost:8888`
- Start the Next.js frontend on `http://localhost:3000`
- Display status messages as each service starts

Then visit `http://localhost:3000` in your browser to use the app.

### Manual Way (Two Terminals)
If you prefer to see separate logs for debugging, use two terminals:

**Terminal 1 - Backend (FastAPI):**
```powershell
uvicorn backend.main:app --reload
```
The backend will run on `http://localhost:8888`

**Terminal 2 - Frontend (Next.js):**
```powershell
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:3000`

### Stopping the App
- Press `Ctrl+C` in the terminal running `python run.py`
- Or close both terminal windows if running manually

## API Endpoints

The backend provides the following REST API endpoints:

### Weather Queries
- `POST /api/weather` - Search for weather by location and save to database
- `GET /api/weather` - Get all stored weather records
- `PUT /api/weather/{record_id}` - Update a weather record
- `DELETE /api/weather/{record_id}` - Delete a weather record
- `GET /api/locations` - Get all unique locations from database

### Geolocation
- `GET /api/reverse-geocode` - Get location name from coordinates (lat/lon)

### Data Export
- `GET /api/export/csv` - Export records as CSV
- `GET /api/export/json` - Export records as JSON
- `GET /api/export/xml` - Export records as XML
- `GET /api/export/markdown` - Export records as Markdown
- `GET /api/export/pdf` - Export records as PDF

All export endpoints support optional filters:
- `?location={name}` - Filter by location name
- `?start_date={YYYY-MM-DD}` - Filter records from this date
- `?end_date={YYYY-MM-DD}` - Filter records until this date

## Environment Setup
The project is configured to automatically activate the virtual environment when opened in VS Code. A `.venv` folder contains all Python dependencies.

## About PM Accelerator
PM Accelerator is a premier product management training and career accelerator. [Learn more on LinkedIn](https://www.linkedin.com/company/pm-accelerator).
