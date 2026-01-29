# 🎯 PROJECT SUMMARY - OPD Token Allocation System

## ✅ What's Been Created

A **complete, production-ready OPD Token Allocation System** using:
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (raw SQL with pg library)
- **Architecture**: RESTful API with clean separation of concerns

## 📦 Complete File List

### Core Files
1. **package.json** - Dependencies and scripts
2. **server.js** - Express server with all routes
3. **.env** - Database configuration (update with your credentials)
4. **.gitignore** - Git ignore rules

### Configuration
5. **config/db.js** - PostgreSQL connection pool

### Data Models (Raw SQL)
6. **models/Doctor.js** - Doctor CRUD operations
7. **models/Slot.js** - Slot management with capacity tracking
8. **models/Token.js** - Token operations with priority handling

### Business Logic
9. **utils/priority.js** - Dynamic priority calculation
10. **services/allocationService.js** - Core allocation algorithms including ripple insertion

### API Routes
11. **routes/doctorRoutes.js** - Doctor and slot endpoints
12. **routes/tokenRoutes.js** - Token booking and management endpoints

### Setup & Testing
13. **scripts/setup.js** - Database schema creation script
14. **simulation/simulateDay.js** - Comprehensive simulation with color output

### Documentation
15. **README.md** - Complete documentation (9.5KB)
16. **QUICKSTART.md** - 5-minute setup guide
17. **postman_collection.json** - Ready-to-import API collection

## 🎨 Key Features Implemented

### 1. Priority-Based Scheduling
- 5 token types with base priorities
- Dynamic priority increases with waiting time
- Fair allocation across patient types

### 2. Ripple Insertion Algorithm
```
Emergency arrives → Insert in first slot
  ↓
Slot full? Kick lowest priority token
  ↓
Move kicked token to next slot
  ↓
Repeat recursively until settled
```

### 3. Real-World Edge Cases
✅ Slot overflow → Waiting list
✅ Emergency insertion → Cascading reallocation
✅ Cancellation → Auto-promotion from waiting list
✅ Concurrent bookings → Transaction-based safety
✅ Priority conflicts → Time-based tiebreaking

### 4. Database Design
- Proper foreign keys and constraints
- Indexed for performance
- ENUM types for type safety
- Transaction support for consistency

## 🚀 How to Use

### Installation (5 minutes)
```bash
# 1. Install PostgreSQL
sudo apt install postgresql

# 2. Create database
sudo -u postgres psql
CREATE DATABASE opd;
\q

# 3. Install dependencies
cd opd-system
npm install

# 4. Setup database tables
npm run setup

# 5. Start server
npm start
```

### Step 6: Run Simulation (Automatic!)
```bash
npm run simulate
```

**No manual setup needed!** The simulation automatically:
- ✅ Creates 3 doctors (Dr. Sarah Johnson, Dr. Michael Chen, Dr. Priya Sharma)
- ✅ Sets up 3 time slots for each doctor
- ✅ Simulates full OPD day with all scenarios
- ✅ Shows aggregate statistics across all doctors

## 📊 API Endpoints Summary

### Doctors
- `POST /doctor` - Create doctor
- `GET /doctor` - List all doctors
- `GET /doctor/:id` - Get doctor details
- `POST /doctor/:id/slot` - Create time slot
- `GET /doctor/:id/slots` - View all slots
- `GET /doctor/:id/summary` - Get allocation summary

### Tokens
- `POST /token/book` - Book normal token (ONLINE, WALKIN, PRIORITY, FOLLOWUP)
- `POST /token/emergency` - Insert emergency token (triggers ripple)
- `POST /token/cancel/:id` - Cancel token
- `GET /token/:id` - Get token details
- `GET /token/doctor/:id` - All tokens for doctor
- `GET /token/slot/:id` - All tokens in slot

## 🎯 Assignment Requirements Met

| Requirement | Status | Implementation |
|------------|--------|----------------|
| Priority-based algorithm | ✅ | Dynamic priority with waiting time bonus |
| Per-slot hard limits | ✅ | Capacity checks with overflow handling |
| Dynamic reallocation | ✅ | Ripple insertion algorithm |
| Multiple token sources | ✅ | 5 types: EMERGENCY, PRIORITY, FOLLOWUP, ONLINE, WALKIN |
| Handle emergencies | ✅ | Cascading reallocation with victim selection |
| Handle cancellations | ✅ | Auto-promotion from waiting list |
| API-based service | ✅ | RESTful API with Express |
| Data schema | ✅ | PostgreSQL with proper relations |
| Documentation | ✅ | Comprehensive README + QUICKSTART |
| Edge cases | ✅ | Failure handling in prioritization logic |
| Simulation | ✅ | Full day simulation with 8 scenarios |

## 🔧 Technology Choices Explained

### Why PostgreSQL over MongoDB?
- ✅ ACID compliance for financial/medical data
- ✅ Strong relationships (foreign keys)
- ✅ Better transaction support
- ✅ Industry standard for healthcare systems

### Why Raw SQL over ORM?
- ✅ Better performance control
- ✅ Complex queries easier to optimize
- ✅ No ORM abstraction overhead
- ✅ Learn raw database operations

### Why Express?
- ✅ Industry standard
- ✅ Minimal, flexible
- ✅ Large ecosystem
- ✅ Easy to test and deploy

## 📈 Scalability Considerations

Already implemented:
- Connection pooling
- Indexed database queries
- Transaction-based operations
- Efficient algorithms (O(n) ripple insertion)

Future improvements:
- Add caching (Redis)
- Add message queue for async operations
- Add rate limiting
- Add authentication/authorization
- Add logging (Winston/Morgan)
- Add monitoring (Prometheus)

## 🎓 Learning Outcomes

By working with this code, you'll understand:
1. **Database Design**: Relations, constraints, indexes
2. **SQL Operations**: Complex queries, transactions
3. **Algorithm Design**: Ripple insertion, priority queues
4. **API Design**: RESTful principles, error handling
5. **Node.js Patterns**: Async/await, connection pooling
6. **Production Practices**: Environment variables, error handling, logging

# PROJECT SUMMARY – OPD Token Allocation System

## 📍 Personal Summary

This project reflects my practical learning in backend development,
database design, and system-level problem solving.

Instead of only implementing basic CRUD APIs, I focused on building
a realistic OPD scheduling system that can handle priorities,
emergencies, cancellations, and capacity constraints.

Most of the development involved iterative testing, debugging,
and improving the allocation logic.

---

## 📘 Project Description

The OPD Token Allocation System is a backend service designed to
manage hospital outpatient appointments.

It supports:

- Fixed doctor time slots
- Limited capacity per slot
- Multiple patient categories
- Emergency insertions
- Waiting lists
- Automatic reallocation

The main objective is to ensure fair and efficient patient scheduling
under real-world constraints.

---

## 🗂️ Project Structure

The project is organized into clear modules:

- **Routes**: Handle API requests and validation
- **Services**: Contain allocation and rebalancing logic
- **Models**: Execute SQL queries
- **Utils**: Priority calculation
- **Scripts**: Database setup
- **Simulation**: System testing

This structure helps in keeping the code maintainable and extensible.

---

## 🧠 Core Allocation Logic

The allocation system works using the following approach:

1. Each token is assigned a base priority based on its type.
2. Waiting time gradually increases priority to avoid starvation.
3. Normal bookings are placed in the earliest available slot.
4. Emergency bookings trigger ripple reallocation.
5. Cancellation triggers rebalancing of waiting tokens.

This ensures that high-priority cases are handled without permanently
blocking other patients.

---

## 🏗️ Technology Stack

- Backend: Node.js, Express.js
- Database: PostgreSQL
- Query Layer: Raw SQL (pg library)
- Testing: Postman, Simulation Scripts
- Configuration: dotenv

---

## 📊 System Workflow

1. Doctors create time slots.
2. Patients request tokens.
3. System calculates priority.
4. Slots are allocated dynamically.
5. Emergency cases trigger reallocation.
6. Cancellations free capacity.
7. Waiting list is rebalanced.

All updates are reflected in the database.

---

## 🚧 Challenges Faced

Some challenges during development included:

- PostgreSQL authentication and configuration
- Route handling and middleware setup
- Debugging ripple insertion logic
- Managing edge cases during overflow
- Maintaining data consistency

These issues were resolved through testing and step-by-step debugging.

---

## 💡 What I Learned

Through this project, I learned:

- Designing allocation algorithms
- Working with relational databases
- Writing modular backend code
- Handling concurrent operations
- Debugging complex workflows
- Structuring scalable systems

This helped strengthen my backend development fundamentals.

---

## 📈 Scalability Considerations

The system supports scalability through:

- Stateless API design
- Database indexing
- Connection pooling
- Service-based architecture

Possible future improvements include:

- Redis-based caching
- Message queues
- Authentication
- Centralized logging
- Monitoring tools

---

## 🧪 Testing and Validation

The system was tested using:

- Postman API collection
- Automated simulation
- Manual database verification

The simulation script demonstrates different scenarios such as
emergencies, cancellations, and slot overflow.

---

## 🏁 Conclusion

This project demonstrates practical backend engineering skills,
including API design, database integration, priority management,
and fault handling.

It reflects a real-world approach to solving scheduling problems
rather than only academic implementation.

---

## 👤 Author

Bhavesh  chaudhary




