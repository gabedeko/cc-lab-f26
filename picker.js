document.addEventListener('DOMContentLoaded', function () {
  fetch("students.json")
    .then((r) => r.json())
    .then((students) => {
      buildWheel(students);
      document.getElementById('spin-btn').addEventListener('click', () => spin(students));
    })
    .catch((err) => console.error("Failed to load students.json", err));
});

function buildWheel(students) {
  const wheel = document.getElementById('wheel');
  const n = students.length;
  const sliceAngle = 360 / n;
  const colorA = '#4a86e8', colorB = '#F6FEDB';

  const stops = [];
  for (let i = 0; i < n; i++) {
    const color = i % 2 === 0 ? colorA : colorB;
    stops.push(`${color} ${i * sliceAngle}deg ${(i + 1) * sliceAngle}deg`);
  }
  wheel.style.background = `conic-gradient(${stops.join(', ')})`;

  const radius = wheel.clientWidth / 2;
  students.forEach((student, i) => {
    const angle = sliceAngle * i + sliceAngle / 2 - 90; // -90 so slice 0's center = 12 o'clock ("up")
    const label = document.createElement('span');
    label.className = 'wheel-label';
    label.textContent = student.name;
    label.style.color = i % 2 === 0 ? '#F6FEDB' : '#4a86e8';
    label.style.transform = `rotate(${angle}deg) translate(${radius * 0.55}px, -0.5em)`;
    wheel.appendChild(label);
  });
}

const EXTRA_SPINS = 5;
let currentRotation = 0;
let spinning = false;

function spin(students) {
  if (spinning) return;
  spinning = true;
  document.getElementById('spin-btn').disabled = true;

  const n = students.length;
  const sliceAngle = 360 / n;
  const winnerIndex = Math.floor(Math.random() * n);
  const winnerCenterAngle = sliceAngle * winnerIndex + sliceAngle / 2;

  // Rotating the wheel by R moves that slice's center to (winnerCenterAngle + R) mod 360;
  // we want it to land at 0 (under the fixed top pointer).
  const targetMod = (360 - winnerCenterAngle) % 360;

  // Always spin forward, at least EXTRA_SPINS full turns beyond the current position.
  const baseline = currentRotation + EXTRA_SPINS * 360;
  const currentBaselineMod = ((baseline % 360) + 360) % 360;
  let delta = targetMod - currentBaselineMod;
  if (delta < 0) delta += 360;
  const finalRotation = baseline + delta;

  const wheel = document.getElementById('wheel');
  wheel.style.transform = `rotate(${finalRotation}deg)`;
  currentRotation = finalRotation;

  wheel.addEventListener('transitionend', function onEnd(e) {
    if (e.propertyName !== 'transform') return;
    wheel.removeEventListener('transitionend', onEnd);
    revealWinner(students[winnerIndex]);
    spinning = false;
    document.getElementById('spin-btn').disabled = false;
  });
}

function revealWinner(student) {
  const el = document.getElementById('winner-reveal');
  el.textContent = `🍭 ${student.name} 🍭`;
  el.classList.remove('show');
  void el.offsetWidth; // restart CSS animation
  el.classList.add('show');
}
