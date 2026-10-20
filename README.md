# ⚡ PowerTrack – Electricity Usage & Bill Estimation System

PowerTrack is a full-stack web application designed to help users monitor household electricity consumption, manage appliances, estimate electricity bills, and understand their energy usage through analytics and AI-powered insights.

The application combines a React frontend, a Java Spring Boot backend, and a MySQL database to provide an interactive electricity usage tracking experience.

## 🚀 Features

- **User Authentication:** User registration and login.
- **Appliance Management:** Add, edit, and delete household appliances.
- **Electricity Usage Tracking:** Estimate energy consumption based on appliance power, quantity, and daily usage hours.
- **Bill Estimation:** Calculate estimated electricity costs using the configured rate per unit.
- **Dashboard:** View daily consumption, monthly usage, estimated bills, and top energy-consuming appliances.
- **Analytics:** Explore electricity consumption summaries.
- **Usage History:** Review recorded usage and estimated bills.
- **AI-Powered Insights:** Generate energy-saving suggestions based on appliance usage data.
- 🏗️ System Architecture

PowerTrack follows a full-stack architecture that connects the user interface, backend services, and database.

              ┌──────────────────────────┐
              │          User            │
              └────────────┬─────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │     React Frontend       │
              │    JavaScript + CSS      │
              │                          │
              │ Dashboard & Analytics    │
              │ Appliance Management     │
              │ Usage History            │
              └────────────┬─────────────┘
                           │
                     REST API Requests
                           │
                           ▼
              ┌──────────────────────────┐
              │    Spring Boot Backend   │
              │                          │
              │ Controllers              │
              │ Business Logic           │
              │ Spring Data JPA          │
              └────────────┬─────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │      MySQL Database      │
              │                          │
              │ User Data                │
              │ Appliance Details        │
              │ Usage History            │
              └──────────────────────────┘

🔄 How It Works

User Interaction: Users register, log in, and manage their household appliances through the React interface.

API Communication: The frontend sends HTTP requests to the Spring Boot backend.

Data Processing: Backend controllers and business logic process requests and calculate electricity usage and estimated bills.

Database Operations: Spring Data JPA communicates with MySQL to store and retrieve application data.

Results Display: The frontend displays usage summaries, estimated bills, analytics, and available energy-saving insights.

## 🛠️ Technologies Used

**Frontend**
- React
- JavaScript
- HTML5
- CSS3
- Vite

**Backend**
- Java
- Spring Boot
- Spring Data JPA
- Maven
- REST APIs

**Database**
- MySQL

**Tools**
- Git
- GitHub
- Vercel for frontend deployment
- PowerTrack/
│
├── frontend/                 (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Appliances.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── UsageHistory.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Settings.jsx
│   │   └── App.jsx
│   └── package.json
│
├── backend/                  (Java + Spring Boot)
│   ├── controller/
│   ├── entity/
│   ├── repository/
│   ├── BackendApplication.java
│   └── pom.xml
│
├── MySQL Database
│
└── README.md



## ⚡ Electricity Consumption Calculation

Electricity consumption is estimated using the appliance's power rating, quantity, and daily operating hours.

**Formula:**

Energy Consumption (kWh) = (Power (W) × Quantity × Hours Used) / 1000

Estimated Electricity Cost = Energy Consumption (kWh) × Rate per Unit

These calculations provide an estimate based on the entered appliance details and configured electricity rate.
## 👥 Contributors

**Vinuthna Toleti** — Project Development, Frontend Development & Backend Integration

## 👨‍💻 Author

**Vinuthna Toleti**

Aspiring Software Developer | B.Tech CSE Student

Interested in:

- Software Development
- Java Programming
- Data Structures & Algorithms
- SQL and Database Management
- Full-Stack Web Development


## 🎯 Project Objective

The objective of PowerTrack is to make household electricity usage easier to understand, help users identify energy-consuming appliances, and support better energy management through usage tracking and estimated billing.

## ⭐ Project

If you find PowerTrack useful or interesting, consider giving the repository a ⭐ on GitHub!

[⭐ Visit PowerTrack on GitHub](https://github.com/Vinuthna-Toleti/PowerTrack)

