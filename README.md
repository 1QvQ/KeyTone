# KeyTone 🎹

KeyTone is a customisable mechanical keyboard acoustic library and specification manager. Built for mechanical keyboard enthusiasts, it allows builders to catalogue their custom keyboard builds, upload typing test audio recordings, visualise acoustic profiles, and compare configurations side-by-side to find their favourite combinations.

🔗 **Live Production URL**: [https://key-tone-eight.vercel.app/](https://key-tone-eight.vercel.app/)

---

## 🚀 Cloud Architecture & Deployment

KeyTone is built with a production-grade multi-cloud architecture designed for maximum performance, high availability, and zero-cost hosting tiers.

```mermaid
graph TD
    User([User Browser]) -->|HTTPS| Frontend[Vercel: Next.js Frontend]
    Frontend -->|REST API| Backend[Render: NestJS Backend]
    Backend -->|Queries| DB[(Supabase: PostgreSQL Database)]
    Backend -->|Uploads| Storage[(Supabase Storage: Media Bucket)]
```

*   **Frontend**: Hosted on **Vercel** (Free Hobby Tier) with automated GitHub CI/CD deployments and optimal edge CDN distribution.
*   **Backend**: Hosted on **Render.com** (Free Web Service Tier) running Node.js 20+.
*   **Database**: **Supabase PostgreSQL** instance with optimised index configurations.
*   **Object Storage**: **Supabase Storage** (Public `uploads` bucket) for hosting uploaded keycap images and high-fidelity typing test WAV/MP3 files.

---

## ✨ Features

*   **Customisable Keyboard Cataloguing**: Track custom builds, brands, layouts, and case colours.
*   **Granular Setup Specifications**: Detail your switches (brand, model, lubed/filmed status, spring weights), keycaps (material, profile, colour), plate materials, and stabiliser modding.
*   **Acoustics Sound Library**: Upload high-fidelity typing tests and play them back dynamically using interactive, client-side rendered audio waveforms (powered by WaveSurfer.js).
*   **Side-by-Side Comparison Matrix**: Choose two configurations to compare their typing feel, switch types, case structures, and acoustic signatures.
*   **Geek-inspired Aesthetic**: Clean, responsive, minimalist-brutalist user interface using pixel fonts and command-line system styling.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: Next.js 15+ (App Router)
*   **State & Caching**: TanStack React Query v5
*   **Styling**: TailwindCSS (Minimalist-brutalist design tokens)
*   **Audio Visualisation**: WaveSurfer.js

### Backend
*   **Framework**: NestJS (Modular Architecture)
*   **Database ORM**: Prisma 7 (PostgreSQL Client)
*   **Runtime Adapter**: `@prisma/adapter-pg` (Rust-free, TypeScript-native database engine)
*   **Security & Auth**: Passport.js + JWT (JSON Web Tokens) with custom guards

---

## 💻 Local Development Setup

### Prerequisites
*   Node.js v20 or higher
*   Docker (Optional, for local PostgreSQL instance)
*   Supabase Account (or local Postgres instance)

### Repository Structure
This is a monorepo containing two main workspaces:
*   `/frontend` - Next.js client-side application
*   `/backend` - NestJS server-side application

---

### 1. Database Setup
Ensure you have a PostgreSQL database running locally (e.g. via Docker on port 5433) or a Supabase project.

If using Docker:
```bash
docker run --name keytone-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=keytone -p 5433:5432 -d postgres
```

---

### 2. Backend Config & Run

Navigate to the backend directory:
```bash
cd backend
```

Create a `.env` file in the `backend/` folder:
```env
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5433/keytone?schema=public"
JWT_SECRET="keytone-super-secret-key-12345"

# Optional: Supabase Storage configurations
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="your-anon-or-service-role-key"
```

Install dependencies:
```bash
npm install
```

Synchronise the database schema using Prisma:
```bash
npx prisma db push
```

Start the NestJS development server:
```bash
npm run start:dev
```

---

### 3. Frontend Config & Run

Navigate to the frontend directory:
```bash
cd ../frontend
```

Create a `.env.local` file in the `frontend/` folder:
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
```

Install dependencies:
```bash
npm install
```

Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📦 Production Deployment Configuration

When deploying the services, the following environment variables must be defined in your cloud hosting panels:

### Backend (Render.com Environment Settings)
*   `DATABASE_URL`: Connection string for your production Supabase database.
*   `JWT_SECRET`: A secure, randomised token string for user session encryption.
*   `SUPABASE_URL`: Your Supabase API domain (e.g. `https://xxx.supabase.co`).
*   `SUPABASE_KEY`: Your Supabase anon or service role API key.
*   `PORT`: `80` (or leave empty to let Render assign port bindings automatically).

### Frontend (Vercel Environment Settings)
*   `NEXT_PUBLIC_BACKEND_URL`: The URL of your deployed Render backend (e.g. `https://keytone-backend.onrender.com` without a trailing slash).

---

## 🔒 Security & Performance Considerations

*   **No Event Loop Blockage**: All file handling utilizes non-blocking asynchronous Promise APIs to prevent thread blocking under heavy traffic.
*   **Horizontal Privilege Protection**: Controller endpoints strictly validate keyboard and configuration ownership, shielding against Insecure Direct Object Reference (IDOR) exploits.
*   **Optimised Lookups**: Relational tables include explicit database indexing on foreign keys (`user_id`, `keyboard_id`, `setup_id`) to maintain query speed as the configuration catalogue grows.
