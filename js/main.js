/**
 * AURAEX MAIN APPLICATION CONTROLLER
 * -------------------------------------------------------------
 * Orchestrates navigation, scroll spy, mobile drawer,
 * and widget life-cycles.
 */

import { initAuth } from './auth.js';
import { initHeroCanvas } from './canvas-hero.js';
import { initIoTSimulator } from './iot-simulator.js';
import { initTradeExplorer } from './trade-explorer.js';
import { initProcessAndWork } from './process-work.js';
import { initFAQ } from './faq.js';
import { initContact } from './contact.js';
import { showToast } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Subsystems
  initAuth();
  initHeroCanvas();
  initIoTSimulator();
  initTradeExplorer();
  initProcessAndWork();
  initFAQ();
  initContact();

  // Navigation Scroll Effect
  const navbar = document.getElementById('site-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // Mobile Menu Drawer
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileOverlay = document.getElementById('mobile-drawer-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    mobileToggle?.classList.add('open');
    mobileDrawer?.classList.add('open');
    mobileOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileToggle?.classList.remove('open');
    mobileDrawer?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  mobileToggle?.addEventListener('click', () => {
    if (mobileDrawer?.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileOverlay?.addEventListener('click', closeMobileMenu);
  mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

  // ScrollSpy Active Nav Highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // Back to Top Button
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Newsletter Subscription Form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      const email = emailInput?.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Invalid Email', 'Please enter a valid email address.', 'warning');
        return;
      }

      showToast('Subscribed', 'Thank you for subscribing to Auraex Global Systems Dispatch.', 'success');
      newsletterForm.reset();
    });
  }

  // Code Inspector tab switcher (Section 3: Web Creation)
  const inspectorTabs = document.querySelectorAll('.inspector-tab');
  const codeContentBox = document.getElementById('inspector-code-content');

  const codeSnippets = {
    react: `<span class="code-comment">// High-Performance Headless Web Platform</span>
<span class="code-keyword">import</span> { useAuraexEngine } <span class="code-keyword">from</span> <span class="code-string">'@auraex/core'</span>;

<span class="code-keyword">export default function</span> <span class="code-func">GlobalPortal</span>() {
  <span class="code-keyword">const</span> { telemetry, latency } = <span class="code-func">useAuraexEngine</span>({ edgeSync: <span class="code-keyword">true</span> });
  <span class="code-keyword">return</span> (
    &lt;<span class="code-func">PlatformLayout</span> status={telemetry.status}&gt;
      &lt;<span class="code-func">TelemetryStream</span> p99={latency.p99} /&gt;
    &lt;/<span class="code-func">PlatformLayout</span>&gt;
  );
}`,
    graphql: `<span class="code-comment"># Unified Cross-Border Data Schema</span>
query GetCorridorStatus($region: TradeRegion!) {
  corridor(region: $region) {
    id
    activeVessels
    customsClearanceP95
    telemetryNodes {
      sensorId
      signalStrength
    }
  }
}`,
    architecture: `<span class="code-comment">/* Edge CDN + Distributed IoT Broker */</span>
Topology: Multi-Region Anycast
Edge Latency: &lt; 28ms globally
Hardware Gateway: MQTT v5.0 over TLS 1.3
Database: Distributed Multi-Master Ledger`
  };

  inspectorTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      inspectorTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const lang = tab.dataset.lang;
      if (codeContentBox && codeSnippets[lang]) {
        codeContentBox.innerHTML = codeSnippets[lang];
      }
    });
  });

  // Mobile App Phone Mockup tab switcher (Section 4: App Creation)
  const phonePillBtns = document.querySelectorAll('.phone-pill-btn');
  const phoneAppTitle = document.getElementById('phone-app-title');
  const phoneAppSubtitle = document.getElementById('phone-app-subtitle');
  const phoneMetric1Val = document.getElementById('phone-metric1-val');
  const phoneMetric2Val = document.getElementById('phone-metric2-val');

  const phoneScreens = {
    fleet: {
      title: 'Global Fleet Telemetry',
      subtitle: 'Real-time transit tracker',
      m1: '142 Vessels',
      m2: '99.98% On-Time'
    },
    iot: {
      title: 'Smart Edge Gateway',
      subtitle: 'Industrial Mesh Diagnostics',
      m1: '1,280 Nodes',
      m2: '0.04% Packet Loss'
    },
    customs: {
      title: 'Customs FastTrack',
      subtitle: 'Automated Tariffs & Clearance',
      m1: '18 min avg',
      m2: 'Zero Penalties'
    }
  };

  phonePillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      phonePillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const screenKey = btn.dataset.screen;
      const screen = phoneScreens[screenKey];
      if (screen) {
        if (phoneAppTitle) phoneAppTitle.textContent = screen.title;
        if (phoneAppSubtitle) phoneAppSubtitle.textContent = screen.subtitle;
        if (phoneMetric1Val) phoneMetric1Val.textContent = screen.m1;
        if (phoneMetric2Val) phoneMetric2Val.textContent = screen.m2;
      }
    });
  });
});
