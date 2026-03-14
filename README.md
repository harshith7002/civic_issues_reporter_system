# Jan Sahayak – Civic Issue Reporting & Verification Platform

Jan Sahayak is a civic-tech platform that helps citizens report local civic issues such as potholes, garbage overflow, broken streetlights, or water leakage.  
The system uses AI-assisted classification, geo-tagging, and community verification to improve transparency and ensure issues are actually resolved.

## 🚀 Problem

Many existing civic grievance portals allow users to submit complaints, but they face several issues:

- Complaints are sometimes marked **resolved even when the problem still exists**
- **Location and image data may not reach field workers properly**
- Lack of **transparency and accountability**
- Citizens cannot verify whether the issue was actually fixed

Jan Sahayak aims to solve these problems by adding a **verification and prioritization layer** on top of existing civic systems.

---

## 💡 Solution

Jan Sahayak introduces an AI-powered civic issue monitoring system that includes:

- 📍 **Geo-tagged issue reporting**
- 📷 **Photo-based complaint submission**
- 🤖 **AI classification of civic issues**
- 🗺 **Map-based visualization of complaints**
- ✅ **Citizen verification before closing complaints**
- 👥 **Community validation for reported issues**
- 📊 **Analytics dashboard for tracking resolution efficiency**

Instead of replacing government portals, this system acts as an **accountability and transparency layer**.

---

## ⚙️ Tech Stack

Frontend  
- React.js  
- CSS / Tailwind  
- Framer Motion (animations)  
- Leaflet.js (map visualization)

Backend  
- Flask API (Python)

Database  
- PostgreSQL / SQLite

AI / ML  
- CNN-based image classification model  
- Python (TensorFlow / Keras / Scikit-learn)

---

## 🖥️ Features

### Citizen Side
- Upload image of civic issue
- Auto-detect issue type
- Location tagging
- Track complaint status
- Community validation

### Admin / Authority Dashboard
- View complaints on a map
- Filter by issue type
- Assign department
- Update resolution status
- Performance analytics

---

## 🧠 How It Works

1. Citizen uploads issue with photo and location  
2. AI model classifies the issue (road, sanitation, electricity, etc.)  
3. Complaint appears on the city map  
4. Authorities view complaints through dashboard  
5. Issue is resolved by field workers  
6. Citizen verifies the resolution before closure

---

## 📊 Project Architecture

