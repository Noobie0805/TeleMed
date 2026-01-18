# Telemedicine Platform with AI Symptom Checker

A full‑stack telemedicine platform with secure patient/doctor flows, appointment management, video consultations, and an AI‑powered symptom checker and chat assistant powered by Groq's Llama 3.1 models.

## Features

- **Patient module**: Registration/login, profile, medical history, appointment booking, and consultation history
- **Doctor module**: Verification workflow, availability management, appointment dashboard, and consultation notes
- **Admin module**: Doctor verification, audit logs, basic analytics, and platform configuration
- **Appointments**: IST‑aware scheduling, conflict checks, no‑show handling, and post‑consult follow‑up data
- **Video consultations**: Jitsi‑based virtual visits launched directly from scheduled appointments

### AI Symptom Checker

- Validates age/gender/symptom structure
- Sends anonymized data to a separate AI service
- Uses Groq llama-3.1-8b-instant to classify urgency, specialities, and possible causes (non‑diagnostic)

### AI Chat Assistant

- **Medical bot**: General health information only, no diagnosis/prescriptions
- **Platform bot**: Help with appointments, platform usage, and navigation
- Intent‑based prompts and safety rules baked in

### AI Isolation Layer

Separate AI service (Node/Express) with internal API key, Redis caching, and safety post‑processing.

## Architecture

The system is split into two backends plus a React frontend:

### Core Backend (Main API)

- **Tech**: Node.js, Express, MongoDB, JWT auth
- **Routes**: `/api/v1/auth`, `/api/v1/patients`, `/api/v1/doctors`, `/api/v1/appointments`, `/api/v1/admin`, `/api/v1/ai/*`
- **Responsibilities**: Authentication, business logic, persistence, and proxying to AI service

### AI Service Backend

- **Tech**: Node.js, Express, Groq SDK, Redis
- **Routes** (internal only):
  - `POST /symptomChecker` – AI symptom analysis (strict JSON)
  - `POST /chat` – AI chat assistant (medicalBot / platform intents)
- **Authentication**: Uses `AI_INTERNAL_KEY` to accept only calls from the main backend
- **AI Models via Groq**:
  - Primary: `llama-3.1-8b-instant`
  - Optional fallback: `llama-3.3-70b-versatile` or `qwen/qwen3-32b` based on deprecation guidance

### Frontend (planned)

- **Tech**: React (or Next.js), planned deployment on Vercel
- **Modules**: patient dashboard, doctor dashboard, admin dashboard, AI symptom/chat UI

### High‑level Data Flow

```
Frontend → Main Backend (/api/v1/ai/symptoms or /ai/chat)
  → Main Backend validates + adds internal auth header
  → AI Service
  → Groq LLM
  → Safety rules applied
  → JSON response
  → Response stored/minimally logged
  → Sent back to frontend
```

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **AI Service**: Node.js, Express, Groq SDK, Redis (cache), custom safety rules
- **AI Models (Groq)**:
  - `llama-3.1-8b-instant` (text chat, symptom reasoning)
  - Optional: `llama-3.3-70b-versatile`, `qwen/qwen3-32b` as fallbacks following Groq deprecation recommendations
- **Video**: Jitsi Meet integration for teleconsultations
- **Deployment** (planned):
  - Main backend + AI service on Render (or similar)
  - Frontend on Vercel
  - MongoDB Atlas for database

<!-- ## Getting Started (Local) -->

### 1. Prerequisites

- Node.js (LTS)
- MongoDB (local or Atlas)
- Redis (for AI service cache, optional but recommended)
- Groq API key from the [Groq Console](https://console.groq.com)

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/telemedicine-platform.git
cd telemedicine-platform
```

Assumed directory structure:

```
.
├── backend/                 # Main backend
│   └── src/...
├── AI_/                     # AI microservice
│   └── src/...
└── frontend/                # React app (planned)
    └── src/...
```

### 3. Environment Variables

**backend/.env**

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

AI_SERVICE_URL=http://localhost:3001
AI_INTERNAL_KEY=super_secret_internal_key
```

**AI_/.env**

```
PORT=3001
GROQ_API_KEY=your_groq_api_key
AI_INTERNAL_KEY=super_secret_internal_key   # must match backend
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Install Dependencies

```bash
# Main backend
cd backend
npm install

# AI service
cd ../AI_
npm install
```

### 5. Run Services

```bash
# In one terminal (AI service)
cd AI_
npm run dev   # or: node index.js

# In another terminal (main backend)
cd backend
npm run dev   # or: node index.js
```

**Health checks:**

- AI Service: `GET http://localhost:3001/health` → `{ status: 'AI Service running', ... }`
- Main Backend: `GET http://localhost:5000/api/v1/health` (if implemented)

## API Overview

### AI Symptom Checker (Internal)

**Endpoint (AI service):**

```
POST /symptomChecker
```

**Request body:**

```json
{
  "age": 28,
  "gender": "male",
  "symptoms": [
    { "name": "headache", "severity": 6, "duration": "2 days" }
  ],
  "duration": "1 week",
  "existingConditions": "hypertension"
}
```

**Response (example):**

```json
{
  "urgency": "mild",
  "suggestedSpecialities": ["neurology"],
  "possible_causes": ["tension-type headache"],
  "emergency": false,
  "disclaimer": "This AI provides general health information only and is not a medical diagnosis."
}
```

> **Note**: The model never diagnoses or prescribes; it only provides general information and an urgency classification as enforced by the prompt and safety layer.

### AI Chat Assistant (Internal)

**Endpoint (AI service):**

```
POST /chat
```

**Request body:**

```json
{
  "message": "I have a headache and slight fever.",
  "intent": "medicalBot"
}
```

**Response (example):**

```json
{
  "response": "I can provide general information about headaches and fever. For a proper assessment, please use the symptom checker or consult a doctor.",
  "suggestedAction": "symptom_check"
}
```

**Intents**: `"medicalBot"` and `"platform"` (telehealth platform assistant)

### Public API (via Main Backend)

The main backend exposes JWT‑protected routes like:

- `POST /api/v1/ai/symptoms` → proxies to AI service `/symptomChecker`
- `POST /api/v1/ai/chat` → proxies to AI service `/chat`

Additional routes for auth, appointments, doctor/admin dashboards are implemented as per requirements.

## Safety & Privacy

- AI service works on minimal necessary, anonymized symptom data
- Output is filtered via `applySafetyRules` to avoid diagnoses, prescriptions, and emergency misuse
- Clear disclaimer sent with AI responses:
  > "This AI provides general health information only and is not a medical diagnosis."
- Internal secret (`AI_INTERNAL_KEY`) ensures the AI service is not directly exposed to the public internet

## Deployment (Suggested)

### Main Backend + AI Service

- Host as two services on Render or similar (Node/Express app with long‑running process)
- Point `AI_SERVICE_URL` in main backend to the deployed AI service URL

### Database

- MongoDB Atlas free tier for persistent data

### Frontend

- Deploy React/Next app on Vercel, with `NEXT_PUBLIC_API_URL` (or similar) pointing at main backend

## Roadmap

- [ ] New React frontend aligned with current backend + AI flows
- [ ] Better admin analytics (AI usage, appointment stats)
- [ ] Email/SMS notifications (Gmail App Password / SMS provider)
- [ ] Additional AI tools (doctor referral explainer, post‑consult summaries)

## License

Add your chosen license here (e.g., MIT).

© 2025 Sarvjeet Kumar
