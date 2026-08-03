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

## 🐳 Docker Deployment
For production deployment, the project includes fully configured Dockerfiles and `docker-compose.yml`.
*(Note: Requires Docker and Docker Compose installed on your system)*

```bash
docker-compose up -d --build
```
This single command will spin up the Next.js Frontend, FastAPI Backend, PostgreSQL (with pgvector), and Redis.

## 🛡️ Safety & Compliance
- Complies with **AJCC 8th Edition** lung cancer staging guidelines.
- Employs a strict **Medical Rules Engine** to intercept and override LLM staging logic.
- Built-in UI disclaimers ensuring the system is utilized as an informational tool, not a diagnostic replacement.

## 📝 License
[MIT License](LICENSE)
