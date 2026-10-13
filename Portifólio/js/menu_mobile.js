'use strict';

document.documentElement.classList.add('js-enabled');
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('#btn-menu-mobile');
const navigation = document.querySelector('#menu-mobile');
const mobileViewport = window.matchMedia('(max-width: 640px)');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

function setMenu(open, restoreFocus = false) {
  navigation.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) setMenu(false, true);
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) setMenu(false);
});
header.addEventListener('focusout', () => {
  requestAnimationFrame(() => {
    if (!header.contains(document.activeElement)) setMenu(false);
  });
});
mobileViewport.addEventListener('change', () => setMenu(false));

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 12);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// Optional enhancement: all content remains visible without JS or observers.
const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('is-pending');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealElements.forEach(element => {
    if (element.getBoundingClientRect().top > window.innerHeight) {
      element.classList.add('is-pending');
      revealObserver.observe(element);
    }
  });
  motionPreference.addEventListener('change', event => {
    if (event.matches) {
      revealElements.forEach(element => element.classList.remove('is-pending'));
      revealObserver.disconnect();
    }
  });
}
const sections = [...document.querySelectorAll('main section[id]')];
if ('IntersectionObserver' in window) {
  const visibleSections = new Set();
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visibleSections.add(entry.target);
      else visibleSections.delete(entry.target);
    });
    const current = sections.find(section => visibleSections.has(section));
    if (!current) return;
    navigation.querySelectorAll('a').forEach(link => {
      if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -45% 0px', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));
}
document.querySelector('#year').textContent = new Date().getFullYear();

const email = 'horaanjos@gmail.com';
const copyStatus = document.querySelector('#copy-status');
document.querySelector('#copy-email').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(email);
    copyStatus.textContent = 'E-mail copiado!';
  } catch {
    copyStatus.textContent = 'Selecione o endereço acima para copiar: ' + email;
  }
});
const form = document.querySelector('#contact-form');
function buildEmailLink(contactForm) {
  const name = contactForm.elements.nome.value.trim();
  const sender = contactForm.elements.email.value.trim();
  const phone = contactForm.elements.telefone.value.trim();
  const subject = contactForm.elements.subject.value.trim();
  const message = contactForm.elements.body.value.trim();
  const lines = ['Nome: ' + name, 'E-mail: ' + sender];
  if (phone) lines.push('WhatsApp: ' + phone);
  lines.push('', message);
  return 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\r\n'));
}
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const name = form.elements.nome.value.trim();
  const subject = form.elements.subject.value.trim();
  const message = form.elements.body.value.trim();
  if (!name || !subject || !message) {
    document.querySelector('#form-status').textContent = 'Preencha nome, assunto e mensagem com seu conteúdo.';
    return;
  }
  window.location.href = buildEmailLink(form);
  document.querySelector('#form-status').textContent = 'Mensagem preparada para abrir no seu aplicativo de e-mail. Revise e envie por lá. Se ele não abrir, use o endereço ao lado.';
});
