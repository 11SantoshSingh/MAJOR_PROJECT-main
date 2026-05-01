# Backend2 Setup Guide (Node.js + MongoDB)

## Prerequisites
- Node.js 14+ installed
- MongoDB account (Atlas cluster setup)

## Installation

1. Navigate to Backend2 folder:
```bash
cd Backend2
```

2. Install dependencies:
```bash
npm install
```

3. Update `.env` file with your MongoDB URI:
```
MONGO_URI=mongodb+srv://rishabh:rishabh@cluster0.jgbjwzi.mongodb.net/?appName=Cluster0
JWT_SECRET=your-secret-key-change-this
PORT=5001
```

## Running the Server

### Development (with auto-reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

Server will run on: `http://localhost:5001`

## Testing API Endpoints

### 1. Patient Registration
```bash
curl -X POST http://localhost:5001/api/patients/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 30,
    "phone": "+1234567890",
    "location": "New York",
    "pincode": "10001"
  }'
```

### 2. Patient Login
```bash
curl -X POST http://localhost:5001/api/patients/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Get All Hospitals
```bash
curl http://localhost:5001/api/hospitals/
```

### 4. Create Appointment (Replace TOKEN with actual token)
```bash
curl -X POST http://localhost:5001/api/appointments/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "hospitalId": "hospital_id_here",
    "date": "2024-12-20",
    "time": "10:00",
    "doctorSpecialty": "Pulmonologist",
    "notes": "Follow-up checkup"
  }'
```

## MongoDB Collections

### patients
- Stores patient information and credentials
- Unique index on email
- Password hashed with bcrypt

### hospitals
- Stores hospital information and credentials
- Unique index on email
- Password hashed with bcrypt

### appointments
- Stores appointment records
- References to patient and hospital
- Status tracking (confirmed, rescheduled, cancelled, completed)

## Project Structure

```
Backend2/
├── config/
│   ├── database.js           ← MongoDB connection
│   └── jwt.js                ← JWT utilities
├── models/
│   ├── Patient.js            ← Patient schema
│   ├── Hospital.js           ← Hospital schema
│   └── Appointment.js        ← Appointment schema
├── controllers/
│   ├── patientController.js  ← Patient logic
│   ├── hospitalController.js ← Hospital logic
│   └── appointmentController.js ← Appointment logic
├── middleware/
│   └── auth.js               ← JWT authentication
├── routes/
│   ├── patientRoutes.js      ← Patient endpoints
│   ├── hospitalRoutes.js     ← Hospital endpoints
│   └── appointmentRoutes.js  ← Appointment endpoints
├── server.js                 ← Main server file
├── package.json              ← Dependencies
├── .env                      ← Environment variables
└── README.md
```

## Security Notes

1. **Password Hashing**: All passwords are hashed with bcrypt before storage
2. **JWT Tokens**: Tokens expire after 24 hours
3. **Authorization**: All user-specific endpoints require valid JWT token
4. **Input Validation**: Uses validator.js for email, phone, pincode validation
5. **CORS**: Enabled for cross-origin requests

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/ |
| JWT_SECRET | Secret key for JWT signing | your-secret-key |
| PORT | Server port | 5001 |
| NODE_ENV | Environment | development/production |

## Troubleshooting

### MongoDB Connection Error
- Check MONGO_URI is correct
- Ensure MongoDB cluster is active
- Verify IP whitelist includes your IP

### Port Already in Use
- Change PORT in .env file
- Or kill process using port 5001

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Next Steps

1. Install dependencies: `npm install`
2. Start Backend2: `npm run dev`
3. Test endpoints using Postman or curl
4. Update Frontend to use Backend2 API endpoints
5. Connect Frontend authentication to this backend
