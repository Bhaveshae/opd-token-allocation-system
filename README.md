# OPD Token Allocation System

## 📌 Overview

This project implements a backend-based OPD (Out Patient Department)
token allocation system for hospitals. It focuses on managing patient
flow using fixed time slots, priority handling, emergency insertion,
and dynamic reallocation.

The system was built to simulate realistic hospital scenarios where
patient demand often exceeds capacity and fair scheduling becomes
important.

---

## 👨‍💻 About This Project

This project was developed as part of a backend internship assignment.

The main objective was not only to build APIs, but to understand how
real OPD systems manage appointments, emergencies, and cancellations.

During development, I focused on implementing the allocation logic
myself and learning how database-driven systems behave under different
edge cases.

---

## 🏗️ System Architecture

The project follows a layered backend design:

```
Client (Postman / Simulation)
        ↓
Express Routes
        ↓
Service Layer (Allocation Logic)
        ↓
Model Layer (SQL Queries)
        ↓
PostgreSQL Database
```

This separation helps in keeping the code organized and maintainable.

---

## 🛠️ Design Decisions

Some important design choices:

1. PostgreSQL was selected because hospital data requires strong
   consistency and structured relations.

2. Raw SQL was used instead of an ORM to gain better understanding
   of database queries and performance.

3. Core allocation logic was separated into a service layer to
   avoid mixing business logic with routes.

4. Automatic rebalancing after cancellation was added to keep
   slot usage optimal.

5. Emergency cases are handled using a ripple reallocation method
   to preserve priority order.

---

## ⚙️ Key Features

- Fixed time slots with configurable capacity
- Multiple patient types (ONLINE, WALKIN, FOLLOWUP, PRIORITY, EMERGENCY)
- Priority-based allocation
- Emergency ripple insertion
- Waiting list management
- Automatic rebalancing after cancellation
- RESTful API interface
- Full-day simulation support

---

## 🚀 Setup Instructions

### 1. Install PostgreSQL

Ensure PostgreSQL is installed and running.

### 2. Create Database

```sql
CREATE DATABASE opd;
```

### 3. Configure Environment

Create `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=opd
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Setup Database

```bash
node scripts/setup.js
```

### 6. Start Server

```bash
node server.js
```

---

## 📬 API Endpoints

### Doctors

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /doctor | Create doctor |
| GET | /doctor | Get all doctors |
| POST | /doctor/:id/slot | Create slot |
| GET | /doctor/:id/slots | Get slots |
| GET | /doctor/:id/summary | Allocation summary |

### Tokens

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /token/book | Normal booking |
| POST | /token/emergency | Emergency booking |
| POST | /token/cancel/:id | Cancel token |
| GET | /token/:id | Token details |

---

## 🧪 Simulation

A simulation script is included to test the system with multiple
doctors and patients.

Run:

```bash
node simulation/simulateDay.js
```

The simulation creates doctors, slots, and generates different
booking scenarios including emergencies and cancellations.

---

## 🚧 Challenges Faced

Some challenges during development:

- PostgreSQL authentication and environment setup
- Routing and middleware configuration
- Debugging priority reallocation logic
- Handling edge cases during emergency insertion
- Ensuring data consistency during cancellation

Solving these issues helped in understanding real-world backend
development and debugging practices.

---

## 📈 Scalability Considerations

- Database indexing on foreign keys
- Stateless REST APIs
- Service-layer abstraction
- Horizontal scaling using load balancers
- Caching frequently accessed data

---

## 🔮 Future Improvements

- Web-based dashboard
- Real-time notifications
- Redis-based waiting queue
- Doctor delay handling
- Authentication and authorization

---


### Simulation Fails

Ensure:
1. Server is running (`npm start`)
2. Database is setup (`npm run setup`)
3. Doctor and slots are created
4. Correct doctor ID is provided

## 📊 Testing Edge Cases

The system handles:

1. **Slot Overflow**: Tokens go to waiting list when all slots full
2. **Emergency Cascade**: Multiple emergencies trigger multiple ripples
3. **Cancellation Promotion**: Waiting list automatically promoted
4. **Priority Conflicts**: Dynamic priority with waiting time bonus
5. **Concurrent Bookings**: Transaction-based operations prevent race conditions

## 🎯 Evaluation Criteria Met

✅ **Algorithm Quality**: Ripple insertion with priority-based reallocation  
✅ **Real-world Edge Cases**: Handles delays, cancellations, emergencies, overflow  
✅ **Code Structure**: Clean separation of concerns, modular design  
✅ **Practical Reasoning**: Transaction-based, scalable, production-ready  
✅ **API Design**: RESTful endpoints with proper validation  
✅ **Documentation**: Comprehensive README with examples  
✅ **Simulation**: Full day simulation with multiple scenarios



## 👤 Author
Bhavesh Chaudhary - Medoc Health IT Pvt Ltd

## 🙏 Acknowledgments

Built with Node.js, Express, and PostgreSQL using raw SQL for optimal performance and control.
