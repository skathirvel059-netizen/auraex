/**
 * AURAEX CONTACT FORM & INQUIRY CONTROLLER
 */

import { showToast } from './toast.js';

export function initContact() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  const submitBtn = document.getElementById('contact-submit-btn');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const orgInput = document.getElementById('contact-org');

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

    // Simulate sending
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Transmitting Brief...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      contactForm.reset();

      showToast(
        'Brief Received',
        `Thank you ${nameInput.value.split(' ')[0]}! An Auraex engineering lead will review your requirements within 24 hours.`,
        'success'
      );
    }, 900);
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
