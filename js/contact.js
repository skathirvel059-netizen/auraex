/**
 * AURAEX CONTACT FORM & INQUIRY CONTROLLER
 */

import { showToast } from './toast.js';
import { recordContactSubmission } from './supabase-client.js';
import { sendContactNotification } from './mailer.js';

export function initContact() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  const submitBtn = document.getElementById('contact-submit-btn');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const orgInput = document.getElementById('contact-org');
    const budgetInput = document.getElementById('contact-budget');

    let isValid = true;

    // Reset previous errors
    contactForm.querySelectorAll('.form-input, .form-textarea').forEach(el => {
      el.classList.remove('is-invalid');
    });
    contactForm.querySelectorAll('.form-error-msg').forEach(el => {
      el.textContent = '';
      el.classList.remove('visible');
    });

    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      showError(nameInput, 'Please provide your full name.');
      isValid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      showError(emailInput, 'Please enter a valid work email address.');
      isValid = false;
    }

    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      showError(messageInput, 'Please provide a brief summary of your project requirements (min 10 characters).');
      isValid = false;
    }

    // Check selected services
    const checkedServices = contactForm.querySelectorAll('input[name="services"]:checked');
    if (checkedServices.length === 0) {
      showToast('Select a Service', 'Please select at least one area of interest (Web, App, IoT, or Trade).', 'warning');
      isValid = false;
    }

    if (!isValid) return;

    // UI Feedback: transmitting
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Transmitting Brief & Syncing...';

    const selectedServiceNames = Array.from(checkedServices).map(cb => {
      return cb.closest('.service-chip')?.querySelector('span')?.textContent.trim() || cb.value;
    });

    const inquiryData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      org: orgInput?.value.trim() || '',
      budget: budgetInput ? budgetInput.options[budgetInput.selectedIndex]?.text : '',
      services: selectedServiceNames,
      message: messageInput.value.trim()
    };

    try {
      // 1. Sync to Supabase table & local history
      await recordContactSubmission(inquiryData);

      // 2. Dispatch real-time email to auraexbeta@gmail.com
      await sendContactNotification(inquiryData);

      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      contactForm.reset();

      showToast(
        'Brief Transmitted & Recorded',
        `Thank you ${inquiryData.name.split(' ')[0]}! Your requirements were recorded in systems and dispatched to auraexbeta@gmail.com.`,
        'success'
      );
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      showToast('Notice', 'Inquiry recorded locally. An Auraex engineer will review your brief shortly.', 'info');
    }
  });

  function showError(inputEl, msg) {
    inputEl.classList.add('is-invalid');
    const group = inputEl.closest('.form-group');
    if (group) {
      const errEl = group.querySelector('.form-error-msg');
      if (errEl) {
        errEl.textContent = msg;
        errEl.classList.add('visible');
      }
    }
  }
}
