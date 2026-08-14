<div align="center">
  <img src="https://raw.githubusercontent.com/TrojanFish/OncoPath/main/app/public/logo.png" width="100" alt="OncoPath Logo">
  <h1>OncoPath</h1>
  <p><strong>Evidence-Based Oncology AI Agent & Clinical Navigation OS</strong></p>
  <p><em>An intelligent lung oncology clinical decision support system grounded in peer-reviewed literature, AJCC/IASLC guidelines, and real-world multi-center prospective cohorts.</em></p>

  <p>
    <a href="README.md"><strong>English</strong></a> |
    <a href="README.zh-CN.md"><strong>中文说明</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2.12-blue?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PostgreSQL-16%2Bpgvector-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker" />
    <img src="https://img.shields.io/badge/PWA-Supported-6C5CE7?style=flat-square" alt="PWA" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
  </p>
</div>

---

## 🌟 Core Vision & Medical Principles

OncoPath bridges the communication gap between complex oncology literature and patients by strictly adhering to the **"Evidence-First, AI-Second"** standard:
1. **Zero Hallucinations & Deterministic Rules**: Core staging, hazard ratios, and clinical paths are hard-coded. Large Language Models (LLMs) are strictly restricted from making arbitrary prognostic guesses or writing prescriptions.
2. **100% Peer-Reviewed Traceability**: Every Hazard Ratio (HR) and 5-year Recurrence-Free Survival (RFS) rate is directly linked to seminal studies (e.g., JTO, Lancet Oncology, JCO, Chest, JCOG0804, ADAURA) with active DOI and PubMed hyperlinks.
3. **Informed Consent & Clinical Collaboration**: Generates structured consultation checklists empowering patients and families to communicate effectively with their attending oncologists.

---

## ✨ Key Features

- 🩺 **Telemedicine 2-Column Split Hero Layout**: Modern clinical aesthetics featuring an interactive real-time telemedicine sandbox, live counters, and reassuring gradient typography.
- 🔬 **Multimodal AI Pathology Parser**: Extracts TNM staging, Spread Through Air Spaces (STAS), Visceral Pleural Invasion (VPI), Lymphovascular Invasion (LVI), IASLC grades, and driver mutations via photo or text.
- 🗺️ **4D Dynamic Oncology Knowledge Graph**: Interactive visual canvas linking pathological risk factors to recurrence pathways and targeted therapy nodes.
- 📚 **3-Tier Intelligent Deduplication Engine**: Ingestion pipeline automatically detects and enriches existing literature via `DOI ➔ PubMed ID ➔ Normalized Title`.
- 📱 **Full PWA WebApp Support**: Native standalone installability ("Add to Home Screen") on iOS & Android with a smooth mobile slide-over drawer menu.
- 🔐 **Dual-Track Secure Admin Access**: Clean public patient UI with seamless automatic authentication and redirection to `/admin` for administrators.

---

## 🐳 VPS Production Deployment Runbook

### 1. First-Time VPS Deployment

#### 1.1 Prerequisites & Server Setup (Ubuntu / Debian)
SSH into your Linux VPS and install Docker & Git:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker engine, Compose, and Git
sudo apt install -y git curl wget docker.io docker-compose

# Start and enable Docker daemon
sudo systemctl enable --now docker
```

> **For CentOS / RHEL / Alibaba Cloud Linux**:
> ```bash
> sudo yum install -y git docker
> sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
> sudo chmod +x /usr/local/bin/docker-compose
> sudo systemctl enable --now docker
> ```

#### 1.2 Firewall & Security Group Ports
Ensure the following ports are open in your cloud provider's firewall (AWS, Azure, DigitalOcean, Alibaba Cloud, Tencent Cloud):
* **`38030`** (TCP) - **OncoPath WebApp Frontend & Admin Studio** (Required)
* **`38080`** (TCP) - Backend FastAPI Endpoint (Optional for direct API calls)

#### 1.3 Clone Repository
```bash
git clone https://github.com/TrojanFish/OncoPath.git
cd OncoPath
```

#### 1.4 Configure Environment Variables (`.env`)
Create and configure the production environment file:

```bash
cp .env.example .env
nano .env
```

Set the required environment keys (Press `Ctrl + O` to save, `Ctrl + X` to exit):
```env
# Required: Google Gemini API Key for multimodal parsing and AI report generation
GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere

# Optional: Admin Studio credentials (customizable)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=OncoPath2026!
ADMIN_SECRET=oncopath_evidence_admin_secret_key_2026

# Optional: Server public host or domain
NEXT_PUBLIC_APP_URL=http://<YOUR_VPS_PUBLIC_IP>:38030
NEXT_PUBLIC_API_URL=http://<YOUR_VPS_PUBLIC_IP>:38080/api
```

#### 1.5 Build and Launch Containers
```bash
docker-compose up -d --build
```
> 💡 **Automatic Setup**: The container automatically connects to PostgreSQL, applies Prisma migrations, and seeds the 500,000+ patient cohort database upon startup.

#### 1.6 Verify Services
```bash
# Check container status (All 4 containers should report 'Up')
docker-compose ps

# Stream frontend container logs
docker-compose logs -f frontend
```

Access the platform at **`http://<YOUR_VPS_PUBLIC_IP>:38030`**.

---

### 2. Routine Updates & Hot Reloading

When updates are published to GitHub, execute the standard update sequence:

```bash
# 1. Navigate to directory
cd ~/OncoPath

# 2. Pull latest code
git pull origin main

# 3. Rebuild and restart containers seamlessly
docker-compose up -d --build

# 4. (Recommended) Reclaim disk space from dangling images
docker image prune -f
```

---

### 3. Operations & Maintenance CheatSheet

| Operation | Command | Description |
| :--- | :--- | :--- |
| **View All Live Logs** | `docker-compose logs -f` | Real-time stream across all microservices |
| **Frontend Logs Only** | `docker-compose logs -f frontend` | Inspect Next.js server logs and errors |
| **Backend Logs Only** | `docker-compose logs -f backend` | Inspect FastAPI & RAG pipeline logs |
| **Restart All Services** | `docker-compose restart` | Fast container restart without rebuilding |
| **Stop Services** | `docker-compose down` | Stop containers (`postgres_data` volume is preserved) |
| **Inspect System Usage** | `docker stats` | Monitor live CPU, RAM, and I/O usage |
| **Reset Database** | `docker-compose down -v` | ⚠️ **Destructive**: Removes database volumes |

---

### 4. Data Persistence & Integrity

* **PostgreSQL Persistence**: Stored securely in Docker named volume `postgres_data`. Code updates (`git pull`) and container rebuilds **never delete** ingested literature, patient profiles, or knowledge graph data.
* **Redis Persistence**: Stored in `redis_data` volume for fast query caching.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 20+
- Python 3.11+

```bash
# 1. Start Frontend
cd app
npm install
npm run dev

# 2. Start Backend (Optional)
cd ../backend
python -m venv venv
# Windows: venv\Scripts\activate | Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Open `http://localhost:3000` to preview.

---

## 🛡️ Medical Disclaimer

1. OncoPath complies with **AJCC 8th/9th Edition** and **IASLC** staging and histology guidelines.
2. This platform is an **informational and educational navigation tool**. All statistical estimates represent population-level clinical cohorts and **do not constitute personal medical diagnoses or drug prescriptions**.
3. All treatment plans, surveillance intervals, and therapeutic decisions must be confirmed with attending specialist oncologists.

---

## 📝 License
Distributed under the [MIT License](LICENSE).
