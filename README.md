# Freshers Competition Scoreboard

A Flask app that shows freshers competition scores and provides an admin panel to edit programme names and scores.

## Admin panel password

- Admin URL: `/admin`
- Hardcoded password: `timecapsule-admin`

## Programmes included by default

- CSE
- IT
- MECH
- ECE & RAI
- EEE

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. (Optional, recommended for Vercel persistence) set:
   - `DATABASE_URL`
   - `TOKEN`

If `DATABASE_URL` is not set, the app uses a local SQLite database (`scores.db`).

## Run locally

```bash
python main.py
```

## Vercel deployment

This repository includes `vercel.json` for Flask deployment on Vercel.
