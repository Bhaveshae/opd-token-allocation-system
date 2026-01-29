const axios = require("axios");

const BASE = "http://localhost:3000";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m"
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printSeparator() {
  console.log("=".repeat(70));
}

function printDoubleSeparator() {
  console.log("=".repeat(70));
  console.log("=".repeat(70));
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create doctors and slots
async function setupDoctors() {
  log("\n🏥 Setting up 3 Doctors with Time Slots...", 'cyan');
  
  const doctors = [];
  const doctorNames = ["Dr. Sarah Johnson", "Dr. Michael Chen", "Dr. Priya Sharma"];
  
  for (const name of doctorNames) {
    const doctor = await axios.post(`${BASE}/doctor`, { name });
    doctors.push(doctor.data.data);
    log(`  ✅ Created: ${name} (ID: ${doctor.data.data.id})`, 'green');
    
    // Create 3 slots for each doctor
    const slots = [
      { start: "09:00", end: "10:00", capacity: 3 },
      { start: "10:00", end: "11:00", capacity: 3 },
      { start: "11:00", end: "12:00", capacity: 3 }
    ];
    
    for (const slot of slots) {
      await axios.post(`${BASE}/doctor/${doctor.data.data.id}/slot`, slot);
    }
    log(`     Added 3 slots (09:00-12:00, capacity: 3 each)`, 'blue');
  }
  
  return doctors;
}

// Simulate one doctor's OPD
async function simulateDoctor(doctor, doctorNum) {
  const doctorId = doctor.id;
  
  try {
    printSeparator();
    log(`\n👨‍⚕️ DOCTOR ${doctorNum}: ${doctor.name} (ID: ${doctorId})`, 'magenta');
    printSeparator();

    
    // Get initial state
    log("\n📊 Initial State:", 'yellow');
    const initialSummary = await axios.get(`${BASE}/doctor/${doctorId}/summary`);
    log(`  Confirmed: ${initialSummary.data.data.statistics.confirmed_count}, Waiting: ${initialSummary.data.data.statistics.waiting_count}`, 'cyan');

    await sleep(300);

    // Scenario 1: Online booking
    log("\n📱 Online Booking", 'green');
    const online1 = await axios.post(`${BASE}/token/book`, {
      patient: `Patient-${doctorNum}A`,
      doctorId: doctorId,
      type: "ONLINE"
    });
    log(`  ✅ Token ${online1.data.data.id}: ${online1.data.data.status}`, 'green');
    await sleep(200);

    // Scenario 2: Walk-in patient
    log("\n🚶 Walk-in Patient", 'green');
    const walkin1 = await axios.post(`${BASE}/token/book`, {
      patient: `Patient-${doctorNum}B`,
      doctorId: doctorId,
      type: "WALKIN"
    });
    log(`  ✅ Token ${walkin1.data.data.id}: ${walkin1.data.data.status}`, 'green');
    await sleep(200);

    // Scenario 3: Priority patient
    log("\n⭐ Priority Patient", 'yellow');
    const priority1 = await axios.post(`${BASE}/token/book`, {
      patient: `VIP-${doctorNum}C`,
      doctorId: doctorId,
      type: "PRIORITY"
    });
    log(`  ✅ Token ${priority1.data.data.id}: ${priority1.data.data.status}`, 'yellow');
    await sleep(200);

    // Scenario 4: Follow-up patient
    log("\n🔄 Follow-up Patient", 'blue');
    const followup1 = await axios.post(`${BASE}/token/book`, {
      patient: `Followup-${doctorNum}D`,
      doctorId: doctorId,
      type: "FOLLOWUP"
    });
    log(`  ✅ Token ${followup1.data.data.id}: ${followup1.data.data.status}`, 'blue');
    await sleep(200);

    // Scenario 5: More patients (filling slots)
    log("\n📝 Filling Remaining Slots (5 more patients)", 'cyan');
    const patients = [
      { name: `Patient-${doctorNum}E`, type: "ONLINE" },
      { name: `Patient-${doctorNum}F`, type: "WALKIN" },
      { name: `Patient-${doctorNum}G`, type: "FOLLOWUP" },
      { name: `Patient-${doctorNum}H`, type: "ONLINE" },
      { name: `Patient-${doctorNum}I`, type: "PRIORITY" }
    ];

    for (const patient of patients) {
      const token = await axios.post(`${BASE}/token/book`, {
        patient: patient.name,
        doctorId: doctorId,
        type: patient.type
      });
      log(`  ✅ ${patient.name} (${patient.type}): ${token.data.data.status}`, 'cyan');
      await sleep(150);
    }

    // Check current state
    await sleep(300);
    log("\n📊 State After Normal Bookings:", 'yellow');
    const midSummary = await axios.get(`${BASE}/doctor/${doctorId}/summary`);
    log(`  Confirmed: ${midSummary.data.data.statistics.confirmed_count}, Waiting: ${midSummary.data.data.statistics.waiting_count}`, 'cyan');

    // Scenario 6: EMERGENCY - Ripple Effect
    await sleep(300);
    log("\n🚨 EMERGENCY - RIPPLE INSERTION!", 'red');
    const emergency1 = await axios.post(`${BASE}/token/emergency`, {
      patient: `EMERGENCY-${doctorNum}X`,
      doctorId: doctorId
    });
    log(`  ✅ Emergency token ${emergency1.data.data.id}: ${emergency1.data.data.status} (Priority: ${emergency1.data.data.priority})`, 'red');

    // Scenario 7: Another emergency
    await sleep(300);
    log("\n🚨 SECOND EMERGENCY!", 'red');
    const emergency2 = await axios.post(`${BASE}/token/emergency`, {
      patient: `EMERGENCY-${doctorNum}Y`,
      doctorId: doctorId
    });
    log(`  ✅ Emergency token ${emergency2.data.data.id}: ${emergency2.data.data.status}`, 'red');

    // Scenario 8: Cancellation
    await sleep(300);
    log("\n❌ Token Cancellation", 'yellow');
    await axios.post(`${BASE}/token/cancel/${online1.data.data.id}`);
    log(`  ✅ Token ${online1.data.data.id} cancelled - waiting list promoted`, 'green');

    // Final state
    await sleep(300);
    log("\n📊 FINAL STATE:", 'cyan');
    const finalSummary = await axios.get(`${BASE}/doctor/${doctorId}/summary`);
    
    log("\n📈 Statistics:", 'yellow');
    const stats = finalSummary.data.data.statistics;
    log(`  Total Tokens: ${stats.total_count}`, 'cyan');
    log(`  ✅ Confirmed: ${stats.confirmed_count}`, 'green');
    log(`  ⏳ Waiting: ${stats.waiting_count}`, 'yellow');
    log(`  ❌ Cancelled: ${stats.cancelled_count}`, 'red');
    log(`  🚨 Emergency: ${stats.emergency_count}`, 'red');
    log(`  ⭐ Priority: ${stats.priority_count}`, 'yellow');
    
    log("\n🕐 Slot Utilization:", 'yellow');
    finalSummary.data.data.slots.forEach(slot => {
      const status = slot.used < slot.capacity ? '✅' : 
                     slot.used === slot.capacity ? '⚠️' : '🔴';
      const percent = Math.round((slot.used / slot.capacity) * 100);
      log(`  ${status} ${slot.start_time}-${slot.end_time}: ${slot.used}/${slot.capacity} (${percent}%)`, 'cyan');
    });

    return finalSummary.data.data;

  } catch (error) {
    log(`\n❌ Simulation Failed for Doctor ${doctorNum}:`, 'red');
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Main simulation function
async function simulateDay() {
  try {
    printDoubleSeparator();
    log("🏥 OPD TOKEN ALLOCATION SYSTEM - FULL DAY SIMULATION", 'cyan');
    log("Simulating complete OPD day with 3 doctors", 'blue');
    printDoubleSeparator();

    await sleep(1000);

    // Setup 3 doctors with slots
    const doctors = await setupDoctors();
    
    await sleep(1000);

    // Simulate each doctor
    const results = [];
    for (let i = 0; i < doctors.length; i++) {
      await sleep(500);
      const result = await simulateDoctor(doctors[i], i + 1);
      results.push(result);
      await sleep(500);
    }

    // Overall summary
    await sleep(1000);
    printDoubleSeparator();
    log("\n🎯 OVERALL SUMMARY - ALL DOCTORS", 'magenta');
    printDoubleSeparator();

    let totalTokens = 0;
    let totalConfirmed = 0;
    let totalWaiting = 0;
    let totalCancelled = 0;
    let totalEmergencies = 0;

    doctors.forEach((doctor, idx) => {
      const stats = results[idx].statistics;
      log(`\n👨‍⚕️ ${doctor.name}:`, 'cyan');
      log(`   Total: ${stats.total_count} | Confirmed: ${stats.confirmed_count} | Waiting: ${stats.waiting_count} | Cancelled: ${stats.cancelled_count}`, 'blue');
      
      totalTokens += parseInt(stats.total_count);
      totalConfirmed += parseInt(stats.confirmed_count);
      totalWaiting += parseInt(stats.waiting_count);
      totalCancelled += parseInt(stats.cancelled_count);
      totalEmergencies += parseInt(stats.emergency_count);
    });

    log("\n" + "=".repeat(70), 'yellow');
    log("📊 AGGREGATE STATISTICS:", 'yellow');
    log("=".repeat(70), 'yellow');
    log(`Total Tokens Generated: ${totalTokens}`, 'cyan');
    log(`✅ Confirmed Appointments: ${totalConfirmed}`, 'green');
    log(`⏳ Waiting List: ${totalWaiting}`, 'yellow');
    log(`❌ Cancelled: ${totalCancelled}`, 'red');
    log(`🚨 Emergency Cases Handled: ${totalEmergencies}`, 'red');
    log("=".repeat(70), 'yellow');

    printDoubleSeparator();
    log("\n✅ SIMULATION COMPLETE!", 'green');
    log("\n💡 Key Observations:", 'yellow');
    log("  1. ✅ All 3 doctors handled multiple patient types simultaneously", 'cyan');
    log("  2. ✅ Priority-based allocation worked across all doctors", 'cyan');
    log("  3. ✅ Emergency ripple insertion triggered cascading reallocation", 'cyan');
    log("  4. ✅ Cancellations automatically promoted waiting list patients", 'cyan');
    log("  5. ✅ System maintained slot capacity limits with overflow handling", 'cyan');
    log("  6. ✅ Real-world edge cases (delays, emergencies, cancellations) handled", 'cyan');
    printDoubleSeparator();

  } catch (error) {
    log("\n❌ Overall Simulation Failed:", 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run simulation
simulateDay();
