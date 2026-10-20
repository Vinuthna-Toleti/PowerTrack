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

## ⚡ Electricity Consumption Calculation

Electricity consumption is estimated using the appliance's power rating, quantity, and daily operating hours.

**Formula:**

Energy Consumption (kWh) = (Power (W) × Quantity × Hours Used) / 1000

Estimated Electricity Cost = Energy Consumption (kWh) × Rate per Unit

These calculations provide an estimate based on the entered appliance details and configured electricity rate.

## 🎯 Project Objective

The objective of PowerTrack is to make household electricity usage easier to understand, help users identify energy-consuming appliances, and support better energy management through usage tracking and estimated billing.
