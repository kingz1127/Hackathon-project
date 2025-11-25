# 🎓 Learner - School Management System

<div align="center">

![Learner Banner](https://via.placeholder.com/1200x300/4A90E2/FFFFFF?text=Learner+School+Management+System)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/kingz1127/Hackathon-project)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16.0+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-4.18+-000000?logo=express)](https://expressjs.com/)

**A comprehensive school management system built collaboratively to streamline education administration**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 📊 System Overview

```mermaid
graph TB
    A[👥 Users] --> B{Authentication}
    B -->|Admin| C[Admin Dashboard]
    B -->|Teacher| D[Teacher Portal]
    B -->|Student| E[Student Portal]
    
    C --> F[Student Management]
    C --> G[Staff Management]
    C --> H[Course Management]
    C --> I[Reports & Analytics]
    
    D --> J[Class Management]
    D --> K[Grade Entry]
    D --> L[Attendance]
    
    E --> M[View Grades]
    E --> N[Assignments]
    E --> O[Timetable]
    
    F --> P[(MongoDB)]
    G --> P
    H --> P
    J --> P
    K --> P
    L --> P
    M --> P
    N --> P
    O --> P
    
    I --> Q[📧 Email Notifications]
    Q --> R[Nodemailer Service]
```

## ✨ Features

### 👨‍💼 For Administrators
```
📈 Dashboard Analytics     → Real-time school performance metrics
👨‍🎓 Student Management     → Complete enrollment and academic tracking
👨‍🏫 Staff Management       → Teacher profiles and performance monitoring
📚 Course Management       → Curriculum creation and subject management
✅ Attendance Tracking     → Comprehensive attendance reports
💰 Fee Management          → Payment tracking and invoice generation
```

### 👨‍🏫 For Teachers
```
🏫 Class Management        → View assigned classes and rosters
📝 Grade Entry             → Record and update assessments
📋 Attendance Marking      → Quick attendance submission
📤 Assignment Distribution → Create and share coursework
💬 Communication Hub       → Direct messaging with students/parents
```

### 👨‍🎓 For Students
```
📊 Academic Dashboard      → View grades and attendance
📥 Assignment Tracking     → Access and submit assignments
🗓️ Timetable View          → Personal class schedule
📈 Progress Reports        → Track academic performance
🔔 Notifications           → Important announcements and updates
```

## 🏗️ Architecture

### System Architecture Diagram

```mermaid
graph LR
    subgraph "Frontend Layer"
        A[React App]
        B[CSS Styling]
        C[Components]
    end
    
    subgraph "Backend Layer"
        D[Express.js Server]
        E[REST API]
        F[Authentication Middleware]
    end
    
    subgraph "Data Layer"
        G[(MongoDB)]
        H[User Collection]
        I[Course Collection]
        J[Attendance Collection]
    end
    
    subgraph "External Services"
        K[📧 Nodemailer]
        L[Email Service]
    end
    
    A --> E
    C --> E
    E --> D
    D --> F
    F --> G
    G --> H
    G --> I
    G --> J
    D --> K
    K --> L
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (React)
    participant B as Backend (Express)
    participant D as Database (MongoDB)
    participant E as Email Service
    
    U->>F: Login Request
    F->>B: POST /api/auth/login
    B->>D: Verify Credentials
    D-->>B: User Data
    B-->>F: JWT Token
    F-->>U: Dashboard Access
    
    U->>F: Submit Assignment
    F->>B: POST /api/assignments
    B->>D: Save Assignment
    D-->>B: Success
    B->>E: Send Notification
    E-->>U: Email Confirmation
    B-->>F: Response
    F-->>U: Success Message
```

## 🛠️ Tech Stack

<div align="center">

```mermaid
graph TD
    A[Learner System] --> B[Frontend]
    A --> C[Backend]
    A --> D[Database]
    A --> E[Services]
    
    B --> B1[⚛️ React 18+]
    B --> B2[🎨 CSS3]
    B --> B3[📱 Responsive Design]
    
    C --> C1[🟢 Node.js]
    C --> C2[⚡ Express.js]
    C --> C3[🔐 JWT Authentication]
    C --> C4[🛡️ Bcrypt]
    
    D --> D1[🍃 MongoDB]
    D --> D2[📦 Mongoose ODM]
    
    E --> E1[📧 Nodemailer]
    E --> E2[✉️ SMTP Integration]
    
    style A fill:#4A90E2,color:#fff
    style B fill:#61DAFB,color:#000
    style C fill:#339933,color:#fff
    style D fill:#47A248,color:#fff
    style E fill:#EA4335,color:#fff
```

</div>

## 🚀 Getting Started

### Prerequisites

```mermaid
graph LR
    A[Requirements] --> B[Node.js v14+]
    A --> C[MongoDB v4.4+]
    A --> D[npm/yarn]
    A --> E[Git]
    
    style A fill:#4A90E2,color:#fff
```

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/kingz1127/Hackathon-project.git
cd Hackathon-project
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Install frontend dependencies**
```bash
cd ../frontend
npm install
```

**4. Configure environment variables**

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/learner
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

**5. Database Setup**
```bash
# Start MongoDB service
mongod

# In a new terminal, seed the database (optional)
cd backend
npm run seed
```

**6. Run the application**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

🎉 **Application running at:** `http://localhost:3000`

## 📁 Project Structure

```
Hackathon-project/
│
├── 📂 frontend/
│   ├── 📂 public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── Admin/
│   │   │   ├── Teacher/
│   │   │   ├── Student/
│   │   │   └── Shared/
│   │   ├── 📂 pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── 📂 styles/
│   │   │   ├── global.css
│   │   │   └── components.css
│   │   ├── 📂 utils/
│   │   │   ├── api.js
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── 📂 backend/
│   ├── 📂 config/
│   │   ├── db.js
│   │   └── email.js
│   ├── 📂 controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   └── teacherController.js
│   ├── 📂 models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Assignment.js
│   │   └── Attendance.js
│   ├── 📂 routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   └── teacherRoutes.js
│   ├── 📂 middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── 📂 utils/
│   │   ├── emailService.js
│   │   └── tokenGenerator.js
│   ├── server.js
│   └── package.json
│
├── 📄 README.md
├── 📄 .gitignore
└── 📄 LICENSE
```

## 🔐 Authentication Flow

```mermaid
stateDiagram-v2
    [*] --> Login
    Login --> ValidateCredentials
    ValidateCredentials --> CheckRole
    
    CheckRole --> AdminDashboard: Admin Role
    CheckRole --> TeacherPortal: Teacher Role
    CheckRole --> StudentPortal: Student Role
    
    ValidateCredentials --> LoginError: Invalid Credentials
    LoginError --> Login
    
    AdminDashboard --> [*]
    TeacherPortal --> [*]
    StudentPortal --> [*]
```

## 📧 Email Notification System

```mermaid
graph TD
    A[Event Trigger] --> B{Event Type}
    
    B -->|Enrollment| C[Welcome Email]
    B -->|Grade Update| D[Grade Notification]
    B -->|Assignment| E[Assignment Alert]
    B -->|Attendance| F[Attendance Warning]
    B -->|Fee| G[Payment Reminder]
    
    C --> H[Nodemailer Service]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[SMTP Server]
    I --> J[📧 User Email]
    
    style A fill:#4A90E2,color:#fff
    style H fill:#EA4335,color:#fff
    style J fill:#34A853,color:#fff
```

### Automated Emails Include:
- ✅ New student enrollment confirmations
- 📊 Grade updates and report cards
- 📝 Assignment due date reminders
- ⚠️ Attendance alerts
- 💰 Fee payment reminders
- 📢 System announcements

## 🔒 Security Features

```mermaid
mindmap
  root((Security))
    Authentication
      JWT Tokens
      Password Hashing
      Session Management
    Authorization
      Role Based Access
      Permission Levels
      Route Protection
    Data Protection
      Input Validation
      SQL Injection Prevention
      XSS Protection
    Communication
      HTTPS
      Secure Headers
      CORS Configuration
```

- 🔐 **JWT Authentication** - Secure token-based authentication
- 🔒 **Password Encryption** - Bcrypt hashing for passwords
- 👥 **Role-Based Access Control** - Admin, Teacher, Student roles
- ✅ **Input Validation** - Server-side validation and sanitization
- 🛡️ **Secure Headers** - Protection against common vulnerabilities

## 📊 Database Schema

```mermaid
erDiagram
    USER ||--o{ ATTENDANCE : records
    USER ||--o{ ASSIGNMENT : submits
    USER ||--o{ GRADE : receives
    COURSE ||--o{ ASSIGNMENT : contains
    COURSE ||--o{ GRADE : includes
    USER ||--o{ COURSE : enrolls
    
    USER {
        string id PK
        string name
        string email
        string role
        string password
        date createdAt
    }
    
    COURSE {
        string id PK
        string name
        string code
        string teacherId FK
        array students
    }
    
    ASSIGNMENT {
        string id PK
        string title
        string courseId FK
        string teacherId FK
        date dueDate
    }
    
    ATTENDANCE {
        string id PK
        string studentId FK
        string courseId FK
        date date
        boolean present
    }
    
    GRADE {
        string id PK
        string studentId FK
        string courseId FK
        number score
        date date
    }
```

## 👥 Team & Contributors

This project is a **collaborative effort** built during a hackathon. We believe in the power of teamwork and open-source contribution!

### 🌟 Core Contributors

<div align="center">

| Role | Contribution |
|------|-------------|
| 🎨 **Frontend Developers** | React components, UI/UX design, responsive layouts |
| ⚙️ **Backend Developers** | API development, database design, authentication |
| 🗄️ **Database Architects** | MongoDB schema, data modeling, optimization |
| 📧 **Integration Specialists** | Nodemailer setup, email templates, notifications |

</div>

### How to Contribute

We welcome contributions from everyone! Here's how you can help:

```mermaid
graph LR
    A[Fork Repository] --> B[Create Branch]
    B --> C[Make Changes]
    C --> D[Write Tests]
    D --> E[Commit Changes]
    E --> F[Push to Branch]
    F --> G[Open Pull Request]
    G --> H[Code Review]
    H --> I[Merge to Main]
    
    style A fill:#4A90E2,color:#fff
    style I fill:#34A853,color:#fff
```

**Step-by-step:**

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. ✏️ **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 **Push** to the branch (`git push origin feature/AmazingFeature`)
5. 🎯 **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Be respectful and collaborative

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run coverage report
npm run test:coverage
```

## 📱 Demo

### Screenshots

<div align="center">

| Admin Dashboard | Teacher Portal | Student View |
|:---------------:|:--------------:|:------------:|
| ![Admin](https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Admin+Dashboard) | ![Teacher](https://via.placeholder.com/300x200/34A853/FFFFFF?text=Teacher+Portal) | ![Student](https://via.placeholder.com/300x200/EA4335/FFFFFF?text=Student+View) |

</div>

## 🚀 Deployment

```mermaid
graph LR
    A[Local Development] --> B[Testing]
    B --> C[Build Production]
    C --> D{Deploy To}
    D -->|Frontend| E[Vercel/Netlify]
    D -->|Backend| F[Heroku/Railway]
    D -->|Database| G[MongoDB Atlas]
    
    E --> H[Live Application]
    F --> H
    G --> H
    
    style H fill:#34A853,color:#fff
```

### Deployment Options

- **Frontend:** Vercel, Netlify, GitHub Pages
- **Backend:** Heroku, Railway, DigitalOcean
- **Database:** MongoDB Atlas, AWS DocumentDB

## 🤝 Support

Need help? We're here for you!

- 🐛 **Issues:** [GitHub Issues](https://github.com/kingz1127/Hackathon-project/issues)
- 📚 **Documentation:** [Wiki](https://github.com/kingz1127/Hackathon-project/wiki)

## 🙏 Acknowledgments

- 💡 Built with passion during a hackathon
- 🌟 Inspired by the need for better education management
- 👏 Thanks to all contributors and supporters
- 📚 Special thanks to the open-source community

## 📈 Project Stats

```mermaid
pie title Technology Distribution
    "React (Frontend)" : 35
    "Node.js/Express (Backend)" : 30
    "MongoDB (Database)" : 20
    "CSS (Styling)" : 10
    "Nodemailer (Email)" : 5
```

---

<div align="center">

**Made with ❤️ by the Learner Team**

⭐ **Star us on GitHub** — it helps!

[Report Bug](https://github.com/kingz1127/Hackathon-project/issues) • [Request Feature](https://github.com/kingz1127/Hackathon-project/issues) • [Documentation](https://github.com/kingz1127/Hackathon-project/wiki)

</div>
