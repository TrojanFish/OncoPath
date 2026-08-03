# OncoPath

> **Evidence-Based Oncology AI Agent Platform**
> 
> *A robust, AI-powered medical platform designed to interpret oncology reports strictly based on real-world medical evidence, AJCC guidelines, and peer-reviewed literature.*

---

## 🌟 Project Vision
The primary goal of this platform is to act as a bridge between complex medical literature and the patients. It is built strictly on the principle of **"Evidence-First, AI-Second"**:
1. **No Hallucinations**: Core clinical rules (such as TNM staging) are hard-coded in the backend. The LLM is restricted from making diagnostic predictions.
2. **Traceability**: Every medical assertion is backed by retrieved literature via a robust RAG (Retrieval-Augmented Generation) pipeline.
3. **Data Privacy**: Fully persistent and isolated user case histories built with FastAPI, SQLAlchemy, and Next.js.

## 🏗 Architecture
This project implements a complete microservice architecture, ready for Docker deployment.

- **Frontend (`/app`)**: Next.js 14, TailwindCSS, React. Dark sci-fi aesthetic focusing on extreme clarity.
- **Backend (`/backend`)**: FastAPI, Python 3.11, Pydantic, SQLAlchemy.
- **Database**: 
  - *Current MVP*: SQLite for rapid local prototyping.
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

## 🐳 VPS / Production Deployment
For production deployment on a Linux VPS (e.g., Ubuntu/Debian), the project includes fully configured Dockerfiles and a `docker-compose.yml`.

### Step 1: Install Docker & Git
SSH into your VPS and install the required tools:
```bash
sudo apt update
sudo apt install git docker.io docker-compose -y
```

### Step 2: Clone the Repository
```bash
git clone https://github.com/TrojanFish/OncoPath.git
cd OncoPath
```

### Step 3: Configure Environment Variables
You must configure the production environment before starting the containers:
```bash
cd backend
cp .env.example .env
nano .env
```
Inside `.env`, make the following changes:
1. Set your `OPENAI_API_KEY`.
2. Change the `DATABASE_URL` to point to the Postgres container:
   `DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/lungevidence`
3. Change the `SECRET_KEY` to a secure random string.

### Step 4: Build and Run
Go back to the root directory and start the services:
```bash
cd ..
docker-compose up -d --build
```

This single command will spin up:
- **Next.js Frontend** (Available at `http://your-vps-ip:3000`)
- **FastAPI Backend** (Internal API)
- **PostgreSQL** (with `pgvector` for semantic search)
- **Redis** (for caching)

*Note: To run in the background permanently, ensure you use the `-d` flag. To stop the services, run `docker-compose down`.*

## 🛡️ Safety & Compliance
- Complies with **AJCC 8th Edition** lung cancer staging guidelines.
- Employs a strict **Medical Rules Engine** to intercept and override LLM staging logic.
- Built-in UI disclaimers ensuring the system is utilized as an informational tool, not a diagnostic replacement.

## 📝 License
[MIT License](LICENSE)
