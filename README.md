<div align="center">
  <img src="https://raw.githubusercontent.com/TrojanFish/OncoPath/main/app/public/logo.svg" width="120" alt="OncoPath Logo">
  <h1>OncoPath</h1>
  <p><strong>Evidence-Based Oncology AI Agent Platform</strong></p>
  <p><em>A robust, AI-powered medical platform designed to interpret oncology reports strictly based on real-world medical evidence, AJCC guidelines, and peer-reviewed literature.</em></p>
</div>

---

## 🌟 Project Vision
The primary goal of this platform is to act as a bridge between complex medical literature and the patients. It is built strictly on the principle of **"Evidence-First, AI-Second"**:
1. **No Hallucinations**: Core clinical rules (such as TNM staging) are hard-coded in the backend. The LLM is restricted from making diagnostic predictions.
2. **Traceability**: Every medical assertion is backed by retrieved literature via a robust RAG (Retrieval-Augmented Generation) pipeline.
3. **Data Privacy**: Fully persistent and isolated user case histories built with FastAPI, SQLAlchemy, and Next.js.

## ✨ Key Features
- **Medical-Grade Data Collection**: Rigorously designed pathology profile forms capturing precise nuances like `Tis/MIA` staging, `IASLC` grades, and exact percentage breakdowns of histology subtypes.
- **Interactive Knowledge Graph**: A dynamically generated, strictly orthogonal medical knowledge graph that visualizes the cause-and-effect relationships between pathological factors (e.g., STAS, CTR, LVI) and clinical prognosis.
- **Evidence-Based Reports**: Matches patient data against a database of seminal oncology studies (e.g., JCOG0804) to provide risk stratification and five-year Recurrence-Free Survival (RFS) projections.
- **Personal Dashboard**: A secure timeline view for users to track historical evaluations and tumor progression.
- **Microservice Architecture**: Fully containerized backend and frontend supporting robust relational databases (SQLite for local, PostgreSQL for prod).

## 🏗 Architecture
This project implements a complete microservice architecture, ready for Docker deployment.

- **Frontend (`/app`)**: Next.js 14, TailwindCSS, React. Dark sci-fi aesthetic focusing on extreme clarity.
- **Backend (`/backend`)**: FastAPI, Python 3.11, Pydantic, SQLAlchemy.
- **Database**: 
  - *Current MVP*: SQLite for rapid local prototyping and user case history.
  - *Production*: PostgreSQL + `pgvector` for high-dimensional semantic search.
- **AI Core**: OpenAI `gpt-4-turbo-preview` / `text-embedding-ada-002` (via Python SDK).

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 20+
- Python 3.11+

### 1. Setup Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

pip install -r requirements.txt

# Configure your API Key
cp .env.example .env
# Edit .env and insert your OPENAI_API_KEY

# Start Server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Setup Frontend
```bash
cd app
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with the platform.

## 🐳 VPS / Production Deployment (Detailed Guide)
For production deployment on a Linux VPS (e.g., Ubuntu/Debian), we use Docker to ensure the environment is identical to development.

### Step 1: Install Docker & Git
SSH into your VPS. If you haven't installed Docker and Git, run:
```bash
sudo apt update
sudo apt install git docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker
```

### Step 2: Clone the Repository
Pull the code from GitHub to your server:
```bash
git clone https://github.com/TrojanFish/OncoPath.git
cd OncoPath
```

### Step 3: Configure Environment Variables
You need to configure environment variables for **both** the backend and the frontend.

**1. Backend Configuration**
```bash
cd backend
cp .env.example .env
nano .env
```
Inside `backend/.env`, you **must** update the following:
- `OPENAI_API_KEY`: Your OpenAI API key for the RAG pipeline.
- `CORS_ORIGINS`: Change this to allow your frontend's address. E.g., `http://<YOUR_VPS_IP>:38030,http://<YOUR_DOMAIN>`.
- `SECRET_KEY`: Change this to a secure random string.
- `DATABASE_URL`: Ensure it points to the Postgres container (default in `docker-compose.yml` is `postgresql+asyncpg://postgres:password@db:5432/oncopath`).

**2. Frontend Configuration**
```bash
cd ../app
cp .env.example .env
nano .env
```
Inside `app/.env`, ensure the API URL points to your backend container or your VPS public IP if exposing directly.
- `NEXT_PUBLIC_API_URL`: Usually `http://<YOUR_VPS_IP>:38080/api` or your backend domain.

### Step 4: Build and Run
Go back to the root directory (`/OncoPath`) and start all services:
```bash
cd ..
docker-compose up -d --build
```
*Note: The `--build` flag ensures that Next.js and Python environments are built fresh with your new `.env` settings.*

### Step 5: Verify Deployment
This single command will spin up 4 containers:
- **oncopath-frontend**: Next.js App (Available at `http://<YOUR_VPS_IP>:38030`)
- **oncopath-backend**: FastAPI Server (Available at `http://<YOUR_VPS_IP>:38080`)
- **oncopath-db**: PostgreSQL Database
- **oncopath-redis**: Redis Cache

**Useful Commands for Maintenance:**
- **View live logs**: `docker-compose logs -f`
- **Restart services**: `docker-compose restart`
- **Stop services**: `docker-compose down`
- **Update to new version**: 
  ```bash
  git pull origin main
  docker-compose up -d --build
  docker image prune -f  # (Optional) Clean up old images
  ```

## 🛡️ Safety & Compliance
- Complies with **AJCC 8th Edition** lung cancer staging guidelines.
- Employs a strict **Medical Rules Engine** to intercept and override LLM staging logic.
- Built-in UI disclaimers ensuring the system is utilized as an informational tool, not a diagnostic replacement.

## 📝 License
[MIT License](LICENSE)
