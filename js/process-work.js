/**
 * AURAEX PROCESS & FEATURED WORK CONTROLLERS
 */

export function initProcessAndWork() {
  // Process Steps Selection
  const stepCards = document.querySelectorAll('.process-step-card');
  const processDetailBox = document.getElementById('process-detail-card');
  const processDetailTitle = document.getElementById('process-detail-title');
  const processDetailDesc = document.getElementById('process-detail-desc');
  const processDetailDeliverables = document.getElementById('process-detail-deliverables');

  const stepData = [
    {
      step: '01',
      title: 'Discovery, Strategic Mapping & Feasibility',
      desc: 'We analyze your operational bottlenecks, market opportunity, hardware constraints, and international regulatory landscape before writing a single line of code or sourcing components.',
      deliverables: ['System Architecture Matrix', 'Hardware Feasibility Review', 'Regulatory & Tariffs Roadmap']
    },
    {
      step: '02',
      title: 'Architectural Blueprinting & Prototyping',
      desc: 'Engineering comprehensive schematics spanning digital UI/UX wireframes, cloud infrastructure topologies, PCB mockups, and supplier sourcing matrices.',
      deliverables: ['Interactive Digital Prototypes', 'Embedded System Block Diagram', 'BOM (Bill of Materials) Cost Model']
    },
    {
      step: '03',
      title: 'Precision UI/UX & Hardware Enclosure Design',
      desc: 'Crafting pixel-perfect web and mobile design systems alongside ergonomic, industrial-grade device enclosures engineered for real-world environmental resistance.',
      deliverables: ['High-Fidelity Design System', 'CAD / 3D Enclosure Renderings', 'Design Tokens & Component Library']
    },
    {
      step: '04',
      title: 'Full-Stack Agile Engineering & Firmware Integration',
      desc: 'Concurrent sprint development across cloud backend, modern web frontend, iOS/Android apps, and C/C++ embedded microcontroller firmware.',
      deliverables: ['Production-Grade Web/Mobile Codebase', 'Over-The-Air (OTA) Firmware Engine', 'REST & GraphQL Unified APIs']
    },
    {
      step: '05',
      title: 'Compliance, Field Testing & QA Verification',
      desc: 'Rigorous end-to-end stress tests: automated unit testing, radio RF validation, environmental thermal cycling, and customs document compliance verification.',
      deliverables: ['Automated QA Test Suites', 'FCC / CE Pre-Certification Reports', 'Cross-Border Customs Pre-Clearing']
    },
    {
      step: '06',
      title: 'Global Deployment, Freight Logistics & Continuous Ops',
      desc: 'Multi-region cloud provisioning, physical batch freight customs handling, telemetry onboarding, and 24/7 proactive monitoring with SLA guarantees.',
      deliverables: ['Global Container Customs Clearance', 'Telemetry Monitoring Hub', 'Ongoing SLA & Continuous Enhancements']
    }
  ];

  stepCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      stepCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const data = stepData[idx];
      if (data && processDetailTitle && processDetailDesc) {
        processDetailTitle.textContent = `${data.step} — ${data.title}`;
        processDetailDesc.textContent = data.desc;
        if (processDetailDeliverables) {
          processDetailDeliverables.innerHTML = data.deliverables
            .map(d => `<span class="badge badge-cyan">✓ ${d}</span>`)
            .join(' ');
        }
      }
    });
  });

  // Featured Work Filter Tabs
  const filterBtns = document.querySelectorAll('.work-filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      workCards.forEach(card => {
        if (filter === 'all' || card.dataset.category.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}
