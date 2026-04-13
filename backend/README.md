# Mobile Health Clinic Backend

A Node.js/Express API for managing rural health clinic operations with offline sync capabilities.

## Features

- JWT Authentication with role-based access
- Patient management
- Vitals recording
- AI-assisted diagnosis (mock)
- Medical records
- Offline sync support
- MySQL database
- Swagger API documentation

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up MySQL database and update `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. Run the application:
   ```bash
   npm start
   ```

4. Access API docs at: http://localhost:4000/api-docs

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Patients
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient

### Vitals
- `POST /api/vitals` - Record vitals
- `GET /api/vitals/:patientId` - Get patient vitals

### AI Diagnosis
- `POST /api/ai/diagnose` - Get AI diagnosis

### Medical Records
- `POST /api/records` - Create medical record
- `GET /api/records/:patientId` - Get patient records

### Sync
- `POST /api/sync` - Bulk data sync

### User Management (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user

## Sample Requests

### Register User
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "health_worker"
}
```

### Create Patient
```json
POST /api/patients
{
  "name": "Jane Smith",
  "DOB": "1990-01-01",
  "gender": "female",
  "location": "Kakuma Village",
  "contact": "+254700000000"
}
```

### Record Vitals
```json
POST /api/vitals
{
  "patient_id": 1,
  "BP": "120/80",
  "temperature": 36.5,
  "glucose": 95,
  "SpO2": 98
}
```

### AI Diagnosis
```json
POST /api/ai/diagnose
{
  "patientId": 1,
  "symptoms": "Fever, cough",
  "vitals": {
    "BP": "120/80",
    "temperature": 38.5,
    "glucose": 95,
    "SpO2": 98
  }
}
```

## Testing

Run tests with:
```bash
npm test
```

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Input validation with express-validator
- SQL injection prevention with parameterized queries
- CORS enabled for cross-origin requests