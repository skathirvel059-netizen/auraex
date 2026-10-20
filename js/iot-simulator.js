/**
 * AURAEX IOT SOLUTIONS - REAL-TIME TELEMETRY SIMULATOR
 * -------------------------------------------------------------
 * Demonstrates live edge hardware data acquisition, waveform plotting,
 * sensor switching, and anomaly stress-testing.
 */

import { showToast } from './toast.js';

export function initIoTSimulator() {
  const canvas = document.getElementById('iot-chart-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.parentElement.offsetWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight);

  window.addEventListener('resize', () => {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  });

  const nodeCards = document.querySelectorAll('.iot-node-card');
  const triggerAnomalyBtn = document.getElementById('btn-iot-anomaly');
  const rebootNodeBtn = document.getElementById('btn-iot-reboot');
  const statusBadge = document.getElementById('iot-status-badge');
  const sampleRateSelect = document.getElementById('iot-sample-rate');

  const sensorConfig = {
    temp: { name: 'Thermal Probe 01', unit: '°C', base: 42.4, variance: 1.8, color: '#00f0ff' },
    pressure: { name: 'Hydraulic Transducer', unit: 'bar', base: 14.2, variance: 0.6, color: '#8b5cf6' },
    vibration: { name: '3-Axis Gyro Harvester', unit: 'Hz', base: 128.5, variance: 8.0, color: '#f59e0b' },
    rssi: { name: 'LoRa Mesh Link Quality', unit: 'dBm', base: -68, variance: 4.0, color: '#10b981' }
  };

  let activeSensor = 'temp';
  let history = new Array(70).fill(sensorConfig.temp.base);
  let anomalyMode = false;
  let sampleInterval = 50;

  // Sensor node card switching
  nodeCards.forEach(card => {
    card.addEventListener('click', () => {
      nodeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeSensor = card.dataset.sensor;
      const cfg = sensorConfig[activeSensor];
      history = new Array(70).fill(cfg.base);
    });
  });

  // Anomaly trigger
  if (triggerAnomalyBtn) {
    triggerAnomalyBtn.addEventListener('click', () => {
      anomalyMode = true;
      if (statusBadge) {
        statusBadge.textContent = 'ANOMALY DETECTED';
        statusBadge.className = 'badge badge-rose';
      }
      showToast('IoT Alert Triggered', `Artificial spike injected into ${sensorConfig[activeSensor].name}`, 'warning');

      setTimeout(() => {
        anomalyMode = false;
        if (statusBadge) {
          statusBadge.textContent = 'ONLINE • 100% NOMINAL';
          statusBadge.className = 'badge badge-emerald';
        }
      }, 4000);
    });
  }

  // Reboot Virtual Node
  if (rebootNodeBtn) {
    rebootNodeBtn.addEventListener('click', () => {
      history = new Array(70).fill(0);
      showToast('Node Calibrated', 'Microcontroller telemetry pipeline re-synced.', 'info');
    });
  }

  // Real-time generator loop
  function getNextValue() {
    const cfg = sensorConfig[activeSensor];
    let val = cfg.base + (Math.random() - 0.5) * cfg.variance * 2;
    if (anomalyMode) {
      val += cfg.variance * (Math.random() > 0.5 ? 4.5 : -4.5);
    }
    return val;
  }

  function renderWaveform() {
    ctx.clearRect(0, 0, width, height);

    const cfg = sensorConfig[activeSensor];
    const step = width / (history.length - 1);

    // Compute min / max for scale
    const minVal = cfg.base - cfg.variance * 3;
    const maxVal = cfg.base + cfg.variance * 3;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Path
    ctx.beginPath();
    history.forEach((val, i) => {
      const normalized = (val - minVal) / (maxVal - minVal || 1);
      const y = height - normalized * (height * 0.75) - height * 0.12;
      const x = i * step;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 14;
    ctx.shadowColor = cfg.color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Gradient fill under curve
    const lastX = (history.length - 1) * step;
    ctx.lineTo(lastX, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, cfg.color.replace(')', ', 0.25)').replace('rgb', 'rgba'));
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Latest point indicator
    const latestVal = history[history.length - 1];
    const latestNorm = (latestVal - minVal) / (maxVal - minVal || 1);
    const latestY = height - latestNorm * (height * 0.75) - height * 0.12;

    ctx.beginPath();
    ctx.arc(lastX, latestY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.shadowColor = cfg.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Update digital readout in DOM
    const activeValueDisplay = document.getElementById(`val-${activeSensor}`);
    if (activeValueDisplay) {
      activeValueDisplay.textContent = `${latestVal.toFixed(1)} ${cfg.unit}`;
    }
  }

  // Interval ticker
  setInterval(() => {
    history.shift();
    history.push(getNextValue());
    renderWaveform();
  }, 100);
}
