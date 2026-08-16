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
    <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Nginx-SSE_Streaming-009639?style=flat-square&logo=nginx" alt="Nginx" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/PIPL-Privacy_Compliant-10b981?style=flat-square" alt="PIPL" />
    <img src="https://img.shields.io/badge/Docker-Production_Ready-2496ED?style=flat-square&logo=docker" alt="Docker" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
  </p>
</div>

---

## 🌟 Core Vision & Medical Principles

OncoPath bridges the communication gap between complex oncology literature and patients by strictly adhering to the **"Evidence-First, AI-Second"** standard:
1. **Zero Hallucinations & Deterministic Rules**: Core staging, hazard ratios, and clinical paths are hard-coded. Large Language Models (LLMs) are strictly restricted from making arbitrary prognostic guesses or writing prescriptions.
2. **100% Peer-Reviewed Traceability**: Every Hazard Ratio (HR) and 5-year Recurrence-Free Survival (RFS) rate is directly linked to seminal studies (e.g., JTO, Lancet Oncology, JCO, Chest, JCOG0804, ADAURA) with active DOI and PubMed hyperlinks.
3. **Informed Consent & Clinical Collaboration**: Generates structured consultation pocket cards empowering patients and families to communicate effectively with their attending oncologists.

---

## ✨ Key Features & Architecture

- 🩺 **Telemedicine Clinical Workstation**: Modern healthcare interface with interactive simulation sandboxes and real-time data boards.
- 🔬 **Multimodal AI Pathology Parser**: Extracts TNM staging, Spread Through Air Spaces (STAS), Visceral Pleural Invasion (VPI), Lymphovascular Invasion (LVI), IASLC grades, and driver mutations via photo or text.
- 🗺️ **4D Dynamic Oncology Knowledge Graph**: Interactive visual canvas linking pathological risk factors to recurrence pathways and targeted therapy nodes.
- 🖼️ **Instant 2x Retina Consultation Pocket Card**: Dedicated standalone rasterization template generating crisp, WeChat-ready and album-friendly consultation checklists in milliseconds.
- 🛡️ **PIPL Privacy & Right-to-be-Forgotten**: Built-in PII sanitizer automatically masking ID numbers, phone numbers, and hospital IDs; one-click permanent profile destruction.
- ⚡ **Production-Tuned Nginx SSE Streaming**: Zero-buffering reverse proxy for smooth typewriter report streaming, 1-year immutable caching for static assets, and IP rate limiting.

---

## 🐳 VPS Production Deployment Runbook

### 1. One-Click Production Deployment

#### 1.1 Prerequisites & Server Setup (Ubuntu / Debian)
SSH into your Linux VPS and install Docker & Git:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker engine, Compose v2, and Git
sudo apt install -y git curl wget docker.io docker-compose-v2

# Start and enable Docker daemon
sudo systemctl enable --now docker
```

#### 1.2 Firewall & Security Group Ports
Ensure the following port is open in your cloud provider's firewall:
* **`38000`** (TCP) - **OncoPath Production Nginx Gateway Port** (Required)

#### 1.3 Clone Repository
```bash
git clone https://github.com/TrojanFish/OncoPath.git
cd OncoPath
```

#### 1.4 Configure Environment Variables (`.env`)
```bash
cp .env.example .env
nano .env
```

Set your configuration parameters (Press `Ctrl + O` to save, `Ctrl + X` to exit):
```env
# Required: Google Gemini API Key for multimodal parsing and AI report generation
GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere

# Optional: Admin Studio credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourStrongAdminPassword2026!
ADMIN_SECRET=your_production_secret_key_2026

# Optional: Production HTTP Port (Default: 38000)
PROD_HTTP_PORT=38000
```

#### 1.5 Start Production Cluster
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
> 💡 **Architecture Note**: This starts three isolated services: **PostgreSQL 16 Database**, **Next.js 16 Web Application**, and **Nginx Reverse Proxy**, and automatically initializes Prisma database schema.

#### 1.6 Verify Health Status & Probes
```bash
# Check container status (should show 'Up healthy')
docker compose -f docker-compose.prod.yml ps

# Test production health probe endpoint
curl http://localhost:38000/api/health
```

Access **`http://<YOUR_VPS_PUBLIC_IP>:38000`** in your browser to experience OncoPath!

---

### 2. Routine Updates & Maintenance

When new updates are pushed to GitHub, run the following standard commands on your VPS:

```bash
# 1. Enter project root
cd /opt/OncoPath

# 2. Pull latest commits from GitHub
git pull origin main

# 3. Rebuild and gracefully restart production containers (preserves DB data)
docker compose -f docker-compose.prod.yml up -d --build

# 4. (Optional) Prune dangling images
docker image prune -f
```

> 💡 **Core Difference: `up -d --build` vs `up -d`**:
> - **`up -d --build` (with `--build`)**: **Required after pulling new code!** Forces Next.js compilation so your updated UI/API code is baked into the new Docker container.
> - **`up -d` (without `--build`)**: Reuses the existing local image for instant startup (use when rebooting the server or only changing `.env` variables without code changes).

---

### 3. Operations & Disaster Recovery CheatSheet

| Scenario | Command | Description |
| :--- | :--- | :--- |
| **View full production logs** | `docker compose -f docker-compose.prod.yml logs -f` | Real-time monitoring across Nginx, App, and DB |
| **View app telemetry logs** | `docker compose -f docker-compose.prod.yml logs -f app` | Inspect JSON telemetry, latencies, and errors |
| **Run automated DB backup** | `bash scripts/backup-db.sh` | Exports compressed gzip snapshot, 30-day rotation |
| **Run safety guardrail tests**| `cd app && npm test` | Executes clinical guardrails & PII sanitization tests |
| **Restart cluster** | `docker compose -f docker-compose.prod.yml restart` | Quick container restart without rebuilding |
| **Stop cluster** | `docker compose -f docker-compose.prod.yml down` | Stops services (preserves `pgdata_prod` volume) |

---

## 💻 Local Development

```bash
# 1. Enter web app directory
cd app

# 2. Install dependencies & start dev server
npm install
npm run dev

# 3. Run guardrail test suite
npm test
```
Visit `http://localhost:3000` to start developing.

---

## 🛡️ Clinical Disclaimer

1. OncoPath strictly adheres to **AJCC 8th/9th Edition** TNM lung cancer staging and **IASLC / CSCO / NCCN** guidelines.
2. This platform is designed as an **evidence-based scientific knowledge retrieval and communication aid**; it **does NOT provide clinical medical diagnoses or prescription directives**.
3. All therapeutic decisions must be made in consultation with qualified attending physicians.

---

## 📝 License
Licensed under the [MIT License](LICENSE).
