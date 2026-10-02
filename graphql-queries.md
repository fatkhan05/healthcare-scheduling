# Ready-to-Use GraphQL Queries & Mutations

Kumpulan contoh query dan mutation GraphQL siap pakai untuk pengujian sistem penjadwalan medis.

---

## 1. Auth Service (`http://localhost:3001/graphql`)

### 1.1. Register User Baru
```graphql
mutation RegisterUser {
  register(input: {
    email: "patient1@example.com"
    password: "secret123"
  }) {
    accessToken
    user {
      id
      email
      createdAt
      updatedAt
    }
  }
}
```

### 1.2. Login User
```graphql
mutation LoginUser {
  login(input: {
    email: "patient1@example.com"
    password: "secret123"
  }) {
    accessToken
    user {
      id
      email
      createdAt
      updatedAt
    }
  }
}
```

### 1.3. Validasi Token JWT
```graphql
query ValidateToken {
  validateToken(token: "PASTE_ACCESS_TOKEN_DI_SINI") {
    valid
    user {
      id
      email
      createdAt
      updatedAt
    }
  }
}
```

---

## 2. Schedule Service (`http://localhost:3002/graphql`)

> 🔑 **HTTP Header Wajib:** Pasang header ini di tab **HTTP HEADERS** di GraphQL Playground `http://localhost:3002/graphql`:
> ```json
> {
>   "Authorization": "Bearer PASTE_ACCESS_TOKEN_DI_SINI"
> }
> ```

### 2.1. Create Customer
```graphql
mutation CreateCustomer {
  createCustomer(input: {
    name: "Dewi Lestari"
    email: "dewi@example.com"
  }) {
    id
    name
    email
    createdAt
    updatedAt
  }
}
```

### 2.2. Get Customers List (Paginasi)
```graphql
query GetCustomers {
  customers(page: 1, limit: 10) {
    total
    page
    limit
    totalPages
    data {
      id
      name
      email
      createdAt
    }
  }
}
```

### 2.3. Get Customer Detail
```graphql
query GetCustomerDetail {
  customer(id: "PASTE_CUSTOMER_ID_DI_SINI") {
    id
    name
    email
    createdAt
    updatedAt
  }
}
```

### 2.4. Update Customer
```graphql
mutation UpdateCustomer {
  updateCustomer(
    id: "PASTE_CUSTOMER_ID_DI_SINI"
    input: {
      name: "Dewi Lestari, M.Si"
      email: "dewi.updated@example.com"
    }
  ) {
    id
    name
    email
    updatedAt
  }
}
```

### 2.5. Create Doctor
```graphql
mutation CreateDoctor {
  createDoctor(input: {
    name: "dr. Budi Santoso, Sp.PD"
  }) {
    id
    name
    createdAt
    updatedAt
  }
}
```

### 2.6. Get Doctors List (Paginasi)
```graphql
query GetDoctors {
  doctors(page: 1, limit: 10) {
    total
    page
    limit
    totalPages
    data {
      id
      name
      createdAt
    }
  }
}
```

### 2.7. Get Doctor Detail
```graphql
query GetDoctorDetail {
  doctor(id: "PASTE_DOCTOR_ID_DI_SINI") {
    id
    name
    createdAt
    updatedAt
  }
}
```

### 2.8. Update Doctor
```graphql
mutation UpdateDoctor {
  updateDoctor(
    id: "PASTE_DOCTOR_ID_DI_SINI"
    input: {
      name: "dr. Budi Santoso, Sp.PD, K-GEH"
    }
  ) {
    id
    name
    updatedAt
  }
}
```

### 2.9. Create Schedule (Jadwal Baru)
```graphql
mutation CreateSchedule {
  createSchedule(input: {
    objective: "Pemeriksaan Kesehatan Routine"
    customerId: "PASTE_CUSTOMER_ID_DI_SINI"
    doctorId: "PASTE_DOCTOR_ID_DI_SINI"
    scheduledAt: "2026-10-15T09:00:00.000Z"
  }) {
    id
    objective
    scheduledAt
    createdAt
    customer {
      id
      name
      email
    }
    doctor {
      id
      name
    }
  }
}
```

### 2.10. Get Schedules List (Paginasi & Filter)
```graphql
query GetSchedulesWithFilter {
  schedules(
    page: 1
    limit: 10
    filter: {
      doctorId: "PASTE_DOCTOR_ID_DI_SINI"
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
        email
      }
      doctor {
        name
      }
    }
  }
}
```

### 2.11. Get Schedule Detail
```graphql
query GetScheduleDetail {
  schedule(id: "PASTE_SCHEDULE_ID_DI_SINI") {
    id
    objective
    scheduledAt
    createdAt
    updatedAt
    customer {
      id
      name
      email
    }
    doctor {
      id
      name
    }
  }
}
```

### 2.12. Delete Schedule (Menghapus Jadwal)
```graphql
mutation DeleteSchedule {
  deleteSchedule(id: "PASTE_SCHEDULE_ID_DI_SINI")
}
```

### 2.13. Delete Customer / Doctor
```graphql
mutation DeleteCustomer {
  deleteCustomer(id: "PASTE_CUSTOMER_ID_DI_SINI")
}

mutation DeleteDoctor {
  deleteDoctor(id: "PASTE_DOCTOR_ID_DI_SINI")
}
```
