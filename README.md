# Healthcare Scheduling System (Microservice Architecture)

Healthcare Scheduling System adalah sistem penjadwalan konsultasi medis berbasis microservice yang dibangun dengan **NestJS**, **PostgreSQL**, **GraphQL (Code-First)**, **Prisma ORM**, **Redis**, **Bull Queue**, **MailHog**, dan **Docker**.

---

## 📐 Arsitektur Sistem

```
                               ┌─────────────────────────┐
                               │  Client / Frontend /    │
                               │   GraphQL Playground    │
                               └────────────┬────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │                                             │
                     ▼ (Port 3001)                                 ▼ (Port 3002)
          ┌─────────────────────┐                       ┌─────────────────────┐
          │    Auth Service     │                       │  Schedule Service   │
          │      (NestJS)       │                       │      (NestJS)       │
          └──────────┬──────────┘                       └────┬─────────────┬──┘
                     │                                       │             │
                     │         REST HTTP Internal Call       │             │
                     │ ◄─────────────────────────────────────┤             │
                     │     POST /internal/validate-token     │             │
                     │                                       │             │
          ┌──────────┴──────────┐                       ┌────┴─────────┐   │   ┌────────────────┐
          │  PostgreSQL (15)    │                       │  PostgreSQL  │   ├──►│  Redis (Cache  │
          │      auth_db        │                       │ schedule_db  │   │   │  & Bull Queue) │
          └─────────────────────┘                       └──────────────┘   │   └────────────────┘
                                                                           │
                                                                           │   ┌────────────────┐
                                                                           └──►│ MailHog (SMTP  │
                                                                               │  Email Server) │
                                                                               └────────────────┘
```

---

## 🛠️ Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL (image `postgres:15-alpine`)
- **ORM**: Prisma ORM
- **API Protocol**: GraphQL Code-First (`@nestjs/graphql` + `@nestjs/apollo`)
- **Authentication**: JWT & Bcrypt (Auth Service) + Inter-service AuthGuard (Schedule Service)
- **Caching**: Redis 7 (`@nestjs/cache-manager` + `cache-manager`)
- **Queue System**: Bull Queue (`@nestjs/bull` + Redis backend)
- **Mail Server**: MailHog (`@nestjs-modules/mailer` + SMTP)
- **Containerization**: Docker & Docker Compose

---

## 🚀 Cara Menjalankan Project

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) sudah terinstal dan berjalan.
- Node.js (v18+) *jika ingin menjalankan tanpa Docker*.

---

### 1. Menjalankan dengan Docker Compose (Direkomendasikan)

1. **Salin Environment Variables:**
   ```bash
   cp .env.example .env
   cp auth-service/.env.example auth-service/.env
   cp schedule-service/.env.example schedule-service/.env
   ```

2. **Jalankan Seluruh Service dengan Docker Compose:**
   ```bash
   docker compose up --build -d
   ```

3. **Inisialisasi Database (Otomatis):**
   Migrasi dan penyinkronan skema database (`npx prisma db push`) akan **dieksekusi secara otomatis** saat container `auth-service` dan `schedule-service` pertama kali start.

4. **URL Akses Layanan:**
   - **Auth Service GraphQL Playground**: [http://localhost:3001/graphql](http://localhost:3001/graphql)
   - **Schedule Service GraphQL Playground**: [http://localhost:3002/graphql](http://localhost:3002/graphql)
   - **MailHog Web UI (Melihat Email Masuk)**: [http://localhost:8025](http://localhost:8025)

---

### 2. Menjalankan Secara Lokal (Tanpa Docker)

1. Pastikan PostgreSQL (port 5432) dan Redis (port 6379) berjalan di lokal.
2. Buat database `auth_db` dan `schedule_db` di PostgreSQL.
3. Jalankan **Auth Service**:
   ```bash
   cd auth-service
   npm install
   npx prisma generate
   npx prisma db push
   npm run start:dev
   ```
4. Jalankan **Schedule Service** (di terminal lain):
   ```bash
   cd schedule-service
   npm install
   npx prisma generate
   npx prisma db push
   npm run start:dev
   ```

---

## 🔑 Environment Variables Reference

### Root `.env` (Docker Compose Configuration)
| Variable | Deskripsi | Default Value |
|---|---|---|
| `POSTGRES_USER` | Username utama PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Password utama PostgreSQL | `your_postgres_password` |
| `POSTGRES_DB` | Database default PostgreSQL | `postgres` |
| `POSTGRES_PORT` | Port PostgreSQL di host | `5432` |
| `AUTH_SERVICE_PORT` | Port publik Auth Service | `3001` |
| `SCHEDULE_SERVICE_PORT` | Port publik Schedule Service | `3002` |
| `AUTH_DATABASE_URL` | Database URL untuk Auth Service | `postgresql://postgres:password@postgres:5432/auth_db?schema=public` |
| `SCHEDULE_DATABASE_URL` | Database URL untuk Schedule Service | `postgresql://postgres:password@postgres:5432/schedule_db?schema=public` |
| `JWT_SECRET` | Secret key penandatanganan JWT | `super_secret_jwt_key_healthcare_2026` |
| `JWT_EXPIRES_IN` | Masa berlaku token JWT | `1d` |
| `AUTH_SERVICE_URL` | URL internal Auth Service | `http://auth-service:3001` |

### `auth-service/.env`
| Variable | Deskripsi | Default Value |
|---|---|---|
| `PORT` | Port HTTP Auth Service | `3001` |
| `DATABASE_URL` | Database URL PostgreSQL (`auth_db`) | `postgresql://postgres:password@localhost:5432/auth_db?schema=public` |
| `JWT_SECRET` | Secret key penandatanganan JWT | `super_secret_jwt_key_healthcare_2026` |
| `JWT_EXPIRES_IN` | Masa berlaku token JWT | `1d` |

### `schedule-service/.env`
| Variable | Deskripsi | Default Value |
|---|---|---|
| `PORT` | Port HTTP Schedule Service | `3002` |
| `DATABASE_URL` | Database URL PostgreSQL (`schedule_db`) | `postgresql://postgres:password@localhost:5432/schedule_db?schema=public` |
| `AUTH_SERVICE_URL` | URL internal untuk validasi token | `http://localhost:3001` |
| `REDIS_HOST` | Host server Redis | `localhost` (atau `redis` di Docker) |
| `REDIS_PORT` | Port server Redis | `6379` |
| `MAIL_HOST` | Host SMTP MailHog | `localhost` (atau `mailhog` di Docker) |
| `MAIL_PORT` | Port SMTP MailHog | `1025` |

---

## 📝 Contoh GraphQL Queries & Mutations

### A. Auth Service (`http://localhost:3001/graphql`)

#### 1. Register User Baru
```graphql
mutation {
  register(input: {
    email: "patient1@example.com"
    password: "secret123"
  }) {
    accessToken
    user {
      id
      email
    }
  }
}
```

#### 2. Login User
```graphql
mutation {
  login(input: {
    email: "patient1@example.com"
    password: "secret123"
  }) {
    accessToken
    user {
      id
      email
    }
  }
}
```

#### 3. Validate Token
```graphql
query {
  validateToken(token: "PASTE_ACCESS_TOKEN_DI_SINI") {
    valid
    user {
      id
      email
      createdAt
    }
  }
}
```

---

### B. Schedule Service (`http://localhost:3002/graphql`)

> ⚠️ **Header Wajib:** Tambahkan header di GraphQL Playground di tab **HTTP HEADERS**:
> ```json
> {
>   "Authorization": "Bearer PASTE_ACCESS_TOKEN_DI_SINI"
> }
> ```

#### 1. Create Customer
```graphql
mutation {
  createCustomer(input: {
    name: "Dewi Lestari"
    email: "dewi@example.com"
  }) {
    id
    name
    email
  }
}
```

#### 2. Get Customers List (Pagination)
```graphql
query {
  customers(page: 1, limit: 10) {
    total
    page
    limit
    totalPages
    data {
      id
      name
      email
    }
  }
}
```

#### 3. Create Doctor
```graphql
mutation {
  createDoctor(input: {
    name: "dr. Budi Santoso, Sp.PD"
  }) {
    id
    name
  }
}
```

#### 4. Get Doctors List
```graphql
query {
  doctors(page: 1, limit: 10) {
    total
    page
    limit
    totalPages
    data {
      id
      name
    }
  }
}
```

#### 5. Create Schedule
```graphql
mutation {
  createSchedule(input: {
    objective: "Pemeriksaan Kesehatan Routine"
    customerId: "PASTE_ID_CUSTOMER_DI_SINI"
    doctorId: "PASTE_ID_DOCTOR_DI_SINI"
    scheduledAt: "2026-10-15T09:00:00.000Z"
  }) {
    id
    objective
    scheduledAt
    customer {
      name
      email
    }
    doctor {
      name
    }
  }
}
```

#### 6. Skenario Error: Bentrok Jadwal Dokter
Jalankan kembali `createSchedule` dengan `doctorId` dan `scheduledAt` yang **sama persis**:
```json
{
  "errors": [
    {
      "message": "Doctor already has a schedule at this time",
      "code": "BAD_REQUEST"
    }
  ],
  "data": null
}
```

#### 7. Get Schedules dengan Filter
```graphql
query {
  schedules(
    page: 1
    limit: 10
    filter: {
      doctorId: "PASTE_ID_DOCTOR_DI_SINI"
      dateFrom: "2026-10-01T00:00:00.000Z"
      dateTo: "2026-10-31T23:59:59.000Z"
    }
  ) {
    total
    page
    limit
    totalPages
    data {
      id
      objective
      scheduledAt
      customer {
        name
      }
      doctor {
        name
      }
    }
  }
}
```

#### 8. Delete Schedule
```graphql
mutation {
  deleteSchedule(id: "PASTE_ID_SCHEDULE_DI_SINI")
}
```

---

## 🧪 Unit Testing & Coverage Report

Untuk menjalankan unit test di masing-masing service:

### Auth Service Tests:
```bash
cd auth-service
npm run test -- --coverage
```
- **Hasil Coverage**: **>70% Statement Coverage** (16 test cases passed).

### Schedule Service Tests:
```bash
cd schedule-service
npm run test -- --coverage
```
- **Hasil Coverage**: **>70% Statement Coverage** (53 test cases passed).

---
