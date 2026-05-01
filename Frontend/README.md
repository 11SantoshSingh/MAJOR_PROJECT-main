# Frontend - Medical Imaging & Appointment Booking System

React frontend with Tailwind CSS for image upload, patient registration, and appointment management.

## Installation

```bash
npm install
```

## Running the App

```bash
npm start
```

App runs on `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── UploadPage.js
│   │   ├── RegisterPage.js
│   │   ├── BookAppointmentPage.js
│   │   └── ProfilePage.js
│   ├── components/
│   │   ├── Navbar.js
│   │   └── Appointment/
│   │       └── RescheduleModal.js
│   ├── context/
│   │   └── UserContext.js
│   ├── utils/
│   │   └── api.js
│   └── App.js
├── public/
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Features

- 📸 Image Upload & Prediction
- 📋 Patient Registration
- 🏥 Hospital Selection
- 📅 Appointment Booking
- 👤 Profile Management
- 🎨 Tailwind CSS Styling

## Technologies

- React 19
- React Router v7
- Axios for API calls
- Tailwind CSS 4
- Context API for state management

## Configuration

Backend URL is set to `http://localhost:5000` by default.
To change, update `src/utils/api.js`
