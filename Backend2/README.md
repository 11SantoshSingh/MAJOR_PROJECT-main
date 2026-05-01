# Backend 2 - Node.js Authentication & MongoDB

Node.js Express backend for authentication, user management, and appointment handling using MongoDB.

## Installation

```bash
npm install
```

## Running the Server

```bash
# Development with nodemon
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5001`

## API Endpoints

### Patient Authentication
- `POST /api/patients/register` - Register new patient
- `POST /api/patients/login` - Login patient
- `GET /api/patients/profile` - Get patient profile (auth required)
- `PUT /api/patients/profile` - Update patient profile (auth required)
- `POST /api/patients/change-password` - Change password (auth required)
- `POST /api/patients/logout` - Logout (auth required)

### Hospital Management
- `POST /api/hospitals/register` - Register hospital
- `POST /api/hospitals/login` - Login hospital
- `GET /api/hospitals/` - Get all hospitals
- `GET /api/hospitals/profile` - Get hospital profile (auth required)
- `PUT /api/hospitals/profile` - Update hospital profile (auth required)

### Appointments
- `POST /api/appointments/` - Create appointment (auth required)
- `GET /api/appointments/my-appointments` - Get my appointments (auth required)
- `GET /api/appointments/:id` - Get appointment details (auth required)
- `PUT /api/appointments/:id/reschedule` - Reschedule appointment (auth required)
- `DELETE /api/appointments/:id/cancel` - Cancel appointment (auth required)

## Database Schemas

### Patient Schema
- name (String, required)
- email (String, unique, required)
- password (String, hashed, required)
- age (Number, required)
- phone (String, required)
- location (String, required)
- pincode (String, required)

### Hospital Schema
- name (String, required)
- email (String, unique, required)
- password (String, hashed, required)
- location (String, required)
- pincode (String, required)
- phone (String, optional)

### Appointment Schema
- patientId (ObjectId, ref: Patient)
- hospitalId (ObjectId, ref: Hospital)
- date (String, required)
- time (String, required)
- doctorSpecialty (String, required)
- notes (String, optional)
- status (enum: confirmed, cancelled, rescheduled, completed)

## Authentication

Uses JWT tokens with:
- Header: `Authorization: Bearer <token>`
- Expiration: 24 hours
- Secret: Set in .env

## Error Handling

Standard HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Server Error

## Dependencies

- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: JWT authentication
- bcryptjs: Password hashing
- cors: Cross-Origin Resource Sharing
- validator: Input validation
- dotenv: Environment variables
