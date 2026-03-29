let countdown;
let timeLeft = 5; // hackathon timer
let unlocked = false;

let points = parseInt(localStorage.getItem("points")) || 0;
let sessions = parseInt(localStorage.getItem("sessions")) || 0;
let minutes = parseInt(localStorage.getItem("minutes")) || 0;
let selectedActivity = "";
let activityHistory = JSON.parse(localStorage.getItem("activityHistory")) || [];

document.getElementById("points").innerText = points;
document.getElementById("sessions").innerText = sessions;
document.getElementById("minutes").innerText = minutes;

const SESSION_MINUTES = 30;

// ACTIVITY SELECTION
function handleActivityChange() {
  const select = document.getElementById("activitySelect");
  const customInput = document.getElementById("customActivity");
  customInput.classList.toggle("hidden", select.value !== "Other");
}

// START TIMER
async function startGrassMode() {
  const selectValue = document.getElementById("activitySelect").value;
  const customValue = document.getElementById("customActivity").value.trim();
  if (!selectValue) return alert("Please choose an activity.");
  selectedActivity = selectValue === "Other" ? customValue : selectValue;
  if (!selectedActivity) return alert("Please enter your activity.");

  if (selectValue === "Other") {
    const validation = await mockValidateActivity(selectedActivity);
    if (!validation.valid) return alert(`Activity not accepted: "${selectedActivity}"`);
    selectedActivity = validation.suggestion || selectedActivity;
  }

  if (countdown) clearInterval(countdown);
  timeLeft = 5;
  unlocked = false;

  document.getElementById("timerSection").classList.remove("hidden");
  document.getElementById("selectActivity").classList.add("hidden");
  document.getElementById("currentActivityText").innerText = `You are doing: ${selectedActivity}`;
  updateTimer();

  countdown = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(countdown);
      completeSession();
    }
  }, 1000);
}

// Timer Display
function updateTimer() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  document.getElementById("timer").innerText =
    `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

// Complete Early
function completeEarly() {
  const photo = prompt("Upload a photo as proof (paste URL or write 'done'):");
  if (!photo) return alert("You must provide proof!");
  alert("🤖 AI verified your activity! ✅");
  clearInterval(countdown);
  completeSession();
}

// Give Up
function giveUp() {
  clearInterval(countdown);
  const penalty = 40;
  points = Math.max(0, points - penalty);
  localStorage.setItem("points", points);
  document.getElementById("points").innerText = points;
  alert("40 marks deducted as penalty.");
  updateMascot("expr/sad.png", "Don't worry, try again! 🌱");
  resetUI();
}

// Complete Session
function completeSession() {
  document.getElementById("timerSection").classList.add("hidden");
  document.getElementById("rewardSection").classList.remove("hidden");

  const earned = unlocked ? 50 : 20;
  points += earned;
  sessions += 1;
  minutes += SESSION_MINUTES;

  localStorage.setItem("points", points);
  localStorage.setItem("sessions", sessions);
  localStorage.setItem("minutes", minutes);

  document.getElementById("points").innerText = points;
  document.getElementById("sessions").innerText = sessions;
  document.getElementById("minutes").innerText = minutes;
  document.getElementById("rewardPoints").innerText = `You earned ${earned} points!`;
  document.getElementById("rewardActivity").innerText = `You completed: ${selectedActivity}`;

  if (selectedActivity) {
    activityHistory.push(selectedActivity);
    localStorage.setItem("activityHistory", JSON.stringify(activityHistory));
  }

  updateMascotWithHabits("expr/very_happy.png");
}

// MOCK AI VALIDATION
async function mockValidateActivity(input) {
  const allowed = ["crochet","origami","calligraphy","gardening","painting","reading","walking","workout"];
  return { valid: allowed.some(a => input.toLowerCase().includes(a)), suggestion: input };
}

// Reset UI
function resetUI() {
  document.getElementById("timerSection").classList.add("hidden");
  document.getElementById("selectActivity").classList.remove("hidden");
  document.getElementById("activitySelect").value = "";
  const custom = document.getElementById("customActivity");
  custom.value = "";
  custom.classList.add("hidden");
  timeLeft = 5;
  unlocked = false;
  selectedActivity = "";
  updateTimer();
}

// Back Button
function back() {
  document.getElementById("rewardSection").classList.add("hidden");
  resetUI();
  updateMascot("expr/happy.png", "Hi mate, ready for our next adventure?");
}

// Post to Feed
function postToFeed() { window.location.href = "community.html"; }

// REDEEM REWARD
function redeemReward() {
  const voucher = document.getElementById("activityVoucher").value;
  if (points < 100) return alert("⚠️ Not enough points to redeem!");
  points -= 100;
  localStorage.setItem("points", points);
  document.getElementById("points").innerText = points;
  alert(`🎉 Redeemed reward: ${voucher}`);
}

// MASCOT
function updateMascot(image, message) {
  const mascot = document.getElementById("mascot");
  const bubble = document.getElementById("speechBubble");
  mascot.src = image;
  bubble.innerText = message;
  bubble.classList.remove("hidden");
  setTimeout(() => bubble.classList.add("hidden"), 8000);
}

// MOCK AI Mascot Habit Analysis
async function updateMascotWithHabits(image) {
  let message = "Great job! Keep it up! 🌟"; 
  try { message = await mockAnalyzeHabits(activityHistory); } 
  catch (e) {}
  updateMascot(image, message);
}

// MOCK AI habit analysis
async function mockAnalyzeHabits(activityHistory) {
  if (activityHistory.length === 0) {
    return "Let's get started with your first activity! 🌱";
  }

  const recent = activityHistory.slice(-5);
  const counts = {};
  recent.forEach(activity => {
    counts[activity] = (counts[activity] || 0) + 1;
  });

  const summary = Object.entries(counts)
    .map(([activity, count]) => 
      count > 1 ? `${activity} x${count}` : activity
    )
    .join(", ");

  return `Nice consistency! You've been focusing on: ${summary}. Keep it up! 🌿`;
}