# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# macOS
brew install postgresql
brew services start postgresql
```

### Step 2: Create Database
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE opd;
\q
```

### Step 3: Install Dependencies
```bash
cd opd-system
npm install
```

### Step 4: Setup Database
```bash
npm run setup
```

### Step 5: Start Server
```bash
npm start
```

### Step 6: Run Simulation (Automatic!)
```bash
npm run simulate
```

**That's it!** The simulation will automatically:
- Create 3 doctors
- Create time slots for each
- Simulate a full OPD day
- Show comprehensive results

No manual setup needed! 🎉

## ✅ You're Done!

The simulation will demonstrate:
- Normal token bookings
- Priority handling
- Emergency ripple insertion
- Cancellation and promotion
- Waiting list management

## 📚 Next Steps

- Read the full README.md
- Explore API endpoints in Postman
- Test edge cases
- Review the algorithm implementation

## ❓ Issues?

Check `README.md` Troubleshooting section or ensure:
1. PostgreSQL is running
2. Database is created
3. Dependencies are installed
4. Port 3000 is free
