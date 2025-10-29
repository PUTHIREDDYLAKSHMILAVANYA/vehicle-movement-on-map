// Initialize map
const map = L.map("map").setView([17.385, 78.4867], 12); // Hyderabad coordinates

// Load map tiles from OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let marker;
let route = [];
let currentIndex = 0;
let isPlaying = false;
let speed = 1000;
let intervalId;

// Fetch route data
fetch("data/dummy-route.json")
  .then((res) => res.json())
  .then((data) => {
    route = data.route;
    console.log("Route loaded:", route);

    // ✅ Draw route on map
    const latlngs = route.map(p => [p.lat, p.lng]);
    L.polyline(latlngs, { color: "blue", weight: 4 }).addTo(map);
    map.fitBounds(latlngs);
  })
  .catch((err) => console.error("Error loading route:", err));


// Elements
const playPauseBtn = document.getElementById("playPauseBtn");
const speedRange = document.getElementById("speedRange");
const coordsDisplay = document.getElementById("coords");
const timestampDisplay = document.getElementById("timestamp");
const elapsedDisplay = document.getElementById("elapsed");
const speedDisplay = document.getElementById("speed");

// Update display info
function updateInfo(point, elapsed) {
  coordsDisplay.textContent = `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
  timestampDisplay.textContent = new Date(point.timestamp).toLocaleTimeString();
  elapsedDisplay.textContent = `${elapsed}s`;
  speedDisplay.textContent = `${point.speed} km/h`;
}

// Move marker step-by-step
function moveVehicle() {
  if (currentIndex >= route.length) {
    clearInterval(intervalId);
    isPlaying = false;
    playPauseBtn.textContent = "Play";
    return;
  }

  const point = route[currentIndex];
  const { lat, lng } = point;

  if (!marker) {
    marker = L.marker([lat, lng]).addTo(map);
  } else {
    marker.setLatLng([lat, lng]);
  }

  updateInfo(point, currentIndex);
  currentIndex++;
}

// Play/Pause button
playPauseBtn.addEventListener("click", () => {
  if (!isPlaying) {
    intervalId = setInterval(moveVehicle, speed);
    playPauseBtn.textContent = "Pause";
  } else {
    clearInterval(intervalId);
    playPauseBtn.textContent = "Play";
  }
  isPlaying = !isPlaying;
});

// Speed control
speedRange.addEventListener("input", (e) => {
  const value = parseFloat(e.target.value);
  speed = 1000 / value;
  if (isPlaying) {
    clearInterval(intervalId);
    intervalId = setInterval(moveVehicle, speed);
  }
});
