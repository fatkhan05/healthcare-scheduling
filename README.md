# Healthcare Scheduling System

Sistem penjadwalan layanan kesehatan berbasis microservice menggunakan NestJS, PostgreSQL, GraphQL (Code-First), Prisma ORM, dan Docker.

## 🏗️ Arsitektur Repository (Monorepo)

```
healthcare-scheduling/
├── docker-compose.yml
├── init-dbs.sh
├── .env.example
├── .env
├── .gitignore
├── README.md
├── auth-service/         # Microservice Autentikasi & Pengguna (Port 3001)
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── .env.example
└── schedule-service/     # Microservice Penjadwalan Medis (Port 3002)
    ├── src/
    ├── prisma/
    ├── Dockerfile
    ├── docker-entrypoint.sh
    └── .env.example
```

## 🛠️ Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL (image `postgres:15-alpine`)
- **ORM**: Prisma ORM
- **API**: GraphQL (Code-First dengan `@nestjs/graphql` + `@nestjs/apollo`)
- **Containerization**: Docker & Docker Compose

## 🚀 Cara Menjalankan Project

### 1. Menggunakan Docker Compose (Direkomendasikan)

1. Salin konfigurasi environment variable:
   ```bash
   cp .env.example .env
   cp auth-service/.env.example auth-service/.env
   cp schedule-service/.env.example schedule-service/.env
   ```

2. Jalankan seluruh service:
   ```bash
   docker-compose up --build -d
   ```

3. Endpoint GraphQL Playground yang tersedia:
   - **Auth Service**: `http://localhost:3001/graphql`
   - **Schedule Service**: `http://localhost:3002/graphql`

### 2. Menjalankan Service Secara Lokal

1. Pastikan PostgreSQL berjalan dan database `auth_db` serta `schedule_db` telah dibuat.
2. Install dependensi dan jalankan migrasi Prisma untuk **Auth Service**:
   ```bash
   cd auth-service
   npm install
   npx prisma generate
   npx prisma db push
   npm run start:dev
   ```
3. Di terminal terpisah, install dependensi dan jalankan migrasi Prisma untuk **Schedule Service**:
   ```bash
   cd schedule-service
   npm install
   npx prisma generate
   npx prisma db push
   npm run start:dev
   ```

## 📋 Catatan Penggunaan

- Skema GraphQL dibuat secara otomatis (*code-first*) dan disimpan pada file `src/schema.gql` di masing-masing service saat aplikasi pertama kali dijalankan.
