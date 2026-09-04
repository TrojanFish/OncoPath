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
    <img src="https://img.shields.io/badge/Vitest-62_Unit_Tests_Passed-success?style=flat-square&logo=vitest" alt="Vitest" />
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
3. **Informed Consent & Clinical Collaboration**: Generates structured consultation pocket cards and A4 prescription-grade checklists empowering patients and families to communicate effectively with their attending oncologists.

---

## ✨ Key Features & Architecture

### 1. 🏥 Clinical Workstation & Multimodal AI
- 🩺 **Telemedicine Clinical Workstation**: Modern healthcare interface with interactive simulation sandboxes and real-time data boards.
- 🔬 **Multimodal AI Pathology Parser**: Extracts TNM staging, Spread Through Air Spaces (STAS), Visceral Pleural Invasion (VPI), Lymphovascular Invasion (LVI), IASLC grades, and driver mutations via photo or text.
- 🗺️ **4D Dynamic Oncology Knowledge Graph**: Interactive visual canvas linking pathological risk factors to recurrence pathways and targeted therapy nodes.
- ⚡ **AI Evidence Reasoning Ticker (`ReasoningTicker`)**: Progressive 4-step streaming MDT consensus engine with sub-second elapsed timers.

### 2. 🛡️ Clinical Reassurance & Longitudinal Tracking
- 🟢 **Tumor Marker Physiological Safety Band**: Semi-transparent 0~5.0 ng/mL green safe floating bands for CEA & CYFRA21-1 with reassuring golden principle banners.
- ⏱️ **VDT Speedometer & Dual-Phase CT Comparison Lens (`VdtGauge` & `CtComparisonLens`)**: Driven by the Schwartz volume doubling formula with clear indolent/active growth categorization and absolute delta tracking (Δ mm & Δ %).
- 🚦 **Post-Op Tri-Color Symptom Triage (`PostOpSymptomTriage`)**: Covers post-operative cough, intercostal numbness/pain, exertional dyspnea, and benign hemoptysis with 24-hour home recovery guidance.

### 3. 📚 Evidence Visual Encyclopedia (Wiki) & Social Sharing
- 📖 **38 Deeply Structured Clinical Topics**: Comprehensive coverage from GGN evolution to pathology risk factors, targeted immunotherapy, and long-term recovery.
- 🧬 **4 Advanced Frontier Topics**: Post-op ctDNA/MRD dynamic surveillance, HER2/ADC breakthroughs (T-DXd), 3rd-Gen EGFR resistance overcoming roadmaps, and nodule microwave ablation/SBRT.
- 📝 **Clinic Questions Cheat-sheet Sync**: One-click bookmarking of Wiki questions that seamlessly populate the Doctor Consultation Card and printable checklists.
- 🖼️ **2x Retina WeChat Poster Generator (`WikiSharePosterModal`)**: Standalone unconstrained offscreen rasterization engine producing full-length, unclipped shareable infographics.

### 4. 🌐 Internationalization & Chinese Script Conversion
- 🔀 **Global Simplified/Traditional Chinese Auto-Conversion (`LangSwitch`)**: Designed for international and overseas Chinese communities, powered by a lightweight client-side OpenCC engine with a permanent toggle button on the right side of the navigation bar for both desktop and mobile; full DOM, AI streaming reports, and knowledge graphs adapt seamlessly.

### 5. 🔒 Production Security & Compliance
- 🛡️ **Singapore PDPA / PIPL Privacy & Right-to-be-Forgotten**: Built-in PII sanitizer automatically masking ID numbers, phone numbers, and hospital IDs; one-click permanent profile destruction.
- 🔐 **PBKDF2 210,000 Rounds Hashing & Anti-Tampering HMAC Session Cookies**: Secure authentication guarding against credential forgery.
- ⚡ **Production-Tuned Nginx SSE Streaming & Cloudflare Proxy**: Restores client IP with `CF-Connecting-IP`, zero-buffering reverse proxy for smooth typewriter report streaming, 1-year immutable caching for static assets, and IP rate limiting.

---

## 🧪 Automated Testing & Quality Assurance

Run the comprehensive unit test and clinical safety suite with `npm test`:

```bash
cd app && npm test
```

```text
 ✓ src/__tests__/staging.test.ts        (18 tests) - AJCC/IASLC 9th TNM & mGGO Solid Core Staging
 ✓ src/__tests__/vdtCalculator.test.ts  (6 tests)  - Schwartz Volume Doubling Time & Growth Trajectory
 ✓ src/__tests__/userAuth.test.ts       (5 tests)  - PBKDF2 Password Hashing & HMAC Session Anti-Tampering
 ✓ src/__tests__/tumorMarkers.test.ts   (5 tests)  - CEA / CYFRA21-1 Physiological Metabolic Safety Bands

=== OncoPath Production Readiness & Guardrails Test ===
✅ [PASS] [PII Privacy Sanitization] - Mask ID, Phone, Name & Inpatient ID
✅ [PASS] [Security & Anti-Abuse Rate Limiter] - Sliding Window Enforcement
✅ [PASS] [IA1 Low-Risk Overtreatment Prevention] - Early Low-Risk Protection
✅ [PASS] [Stage IIIA / N2 & STAS+ Precision Targeting] - High-Risk ADAURA Targeting
✅ [PASS] [Auth & Session Security (P1)] - HMAC Signatures & Cookie Extraction
✅ [PASS] [Deterministic Staging Engine (P0)] - mGGO Solid Staging & VPI Upstaging

🎉 ALL 40 UNIT & GUARDRAIL TESTS PASSED! System is ready for production.
```

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
 
#### 7. Domain Binding & Cloudflare Origin Rules Setup (Port 38000 Proxying)

If your domain is hosted on Cloudflare with the Orange Cloud (Proxy) enabled, you can route standard `https://yourdomain.com` directly to internal port 38000 without exposing `:38000` in the browser URL:

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and select your domain;
2. Navigate to **Rules** ➡️ **Origin Rules** ➡️ Click **Create Rule**;
3. Configure the rule parameters:
   * **Rule name**: `OncoPath Port 38000`
   * **Field**: Select `Hostname`
   * **Operator**: Select `equals`
   * **Value**: Enter your domain (e.g., `yourdomain.com` or `oncopath.yourdomain.com`)
   * **Destination Port**: Select **Rewrite to...** ➡️ Enter **`38000`**
4. Click **Deploy**;
5. Wait 1~2 minutes for the rule to propagate, then open 👉 **`https://yourdomain.com`** in any browser!

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

---

### 3. Operations & Disaster Recovery CheatSheet

| Scenario | Command | Description |
| :--- | :--- | :--- |
| **View full production logs** | `docker compose -f docker-compose.prod.yml logs -f` | Real-time monitoring across Nginx, App, and DB |
| **View app telemetry logs** | `docker compose -f docker-compose.prod.yml logs -f app` | Inspect JSON telemetry, latencies, and errors |
| **Run automated DB backup** | `bash scripts/backup-db.sh` | Exports compressed gzip snapshot, 30-day rotation |
| **Run test & guardrail suite**| `cd app && npm test` | Executes 62 unit tests & 6 clinical guardrails |
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

# 3. Run automated tests
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
