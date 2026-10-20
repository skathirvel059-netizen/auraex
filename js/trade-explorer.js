/**
 * AURAEX IMPORT & EXPORT - GLOBAL TRADE CORRIDOR EXPLORER
 * -------------------------------------------------------------
 * Visualizes cross-border supply chains, customs clearance latency,
 * freight corridors, and compliance automation.
 */

export function initTradeExplorer() {
  const corridorBtns = document.querySelectorAll('.corridor-btn');
  const titleEl = document.getElementById('corridor-title');
  const descEl = document.getElementById('corridor-desc');
  const transitEl = document.getElementById('corridor-transit');
  const clearanceEl = document.getElementById('corridor-clearance');
  const hubsEl = document.getElementById('corridor-hubs');
  const cargoEl = document.getElementById('corridor-cargo');
  const routeOriginEl = document.getElementById('corridor-origin');
  const routeDestEl = document.getElementById('corridor-dest');

  const corridorData = {
    transpacific: {
      title: 'Trans-Pacific Technology & Hardware Corridor',
      desc: 'High-frequency supply lane optimizing electronic components, sensor modules, and IoT PCB assemblies from East Asia manufacturing hubs straight into North American tech hubs with pre-cleared customs documentation.',
      transit: '11.4 Days (Sea) / 32h (Air Express)',
      clearance: '99.8% Automated FastTrack',
      hubs: '14 Bonded Enclaves',
      cargo: 'Microcontrollers, Sensor Modules, IoT Enclosures',
      origin: 'Tokyo & Shenzhen Hubs',
      dest: 'Long Beach & Silicon Valley'
    },
    silkroad: {
      title: 'Asia-Europe Maritime & Rail Strategic Axis',
      desc: 'Intermodal freight bridging industrial automation hardware, precision optics, and green technology components between Singapore, Dubai, and European industrial centres with automated multi-currency invoicing.',
      transit: '16.2 Days (Intermodal)',
      clearance: '99.4% Automated FastTrack',
      hubs: '22 Inland Depots',
      cargo: 'Precision Robotics, Power Supplies, Industrial Edge Gear',
      origin: 'Singapore Maritime Terminal',
      dest: 'Rotterdam & Hamburg Ports'
    },
    transatlantic: {
      title: 'Trans-Atlantic High-Spec & MedTech Corridor',
      desc: 'Specialized climate-controlled trade conduit handling sensitive medical IoT diagnostic equipment, aerospace electronics, and high-purity components with end-to-end telemetry and chain-of-custody logging.',
      transit: '6.8 Days (Express Maritime)',
      clearance: '99.9% Direct Pre-Clearance',
      hubs: '9 Bonded Facilities',
      cargo: 'Diagnostic Telemetry, Aerospace Components, High-Spec Alloys',
      origin: 'Frankfurt & London Hubs',
      dest: 'New York & Savannah Ports'
    },
    panamerican: {
      title: 'Pan-American Nearshore Intermodal Network',
      desc: 'Rapid ground and rail corridor designed for agile nearshore operations under USMCA agreements, allowing same-week turnaround on rapid electronic prototyping and industrial hardware assemblies.',
      transit: '2.1 Days (Intermodal Rail/Ground)',
      clearance: '100% USMCA FastClear',
      hubs: '11 Intermodal Terminals',
      cargo: 'Wiring Assemblies, Smart Power Hardware, Metal Chassis',
      origin: 'Monterrey Manufacturing Zone',
      dest: 'Austin & Chicago Distribution Hubs'
    }
  };

  corridorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      corridorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const key = btn.dataset.corridor;
      const data = corridorData[key];
      if (!data) return;

      if (titleEl) titleEl.textContent = data.title;
      if (descEl) descEl.textContent = data.desc;
      if (transitEl) transitEl.textContent = data.transit;
      if (clearanceEl) clearanceEl.textContent = data.clearance;
      if (hubsEl) hubsEl.textContent = data.hubs;
      if (cargoEl) cargoEl.textContent = data.cargo;
      if (routeOriginEl) routeOriginEl.textContent = data.origin;
      if (routeDestEl) routeDestEl.textContent = data.dest;
    });
  });
}
