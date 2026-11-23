// ===== Utilidades =====
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ===== Año del footer =====
$('#year').textContent = new Date().getFullYear();

// ===== Menú móvil =====
const menuBtn = $('#menuBtn');
const nav = $('#nav');

function closeMenu() {
  nav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
$$('#nav a').forEach(a => a.addEventListener('click', closeMenu));

// ===== Header y botón "volver arriba" =====
const header = $('.header');
const toTop = $('#toTop');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
  toTop.classList.toggle('show', window.scrollY > 600);
}, { passive: true });

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== Animación de aparición =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => revealObserver.observe(el));

// ===== Contadores animados =====
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(p * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach(c => countObserver.observe(c));

// ===== Modal de solicitud de propuesta =====
const modal = $('#modal');
let lastFocus = null;

function openModal() {
  lastFocus = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  closeMenu();
  setTimeout(() => $('input[name="nombre"]', modal).focus(), 250);
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}

$$('[data-open-modal]').forEach(b => b.addEventListener('click', openModal));
$$('[data-close-modal]').forEach(b => b.addEventListener('click', closeModal));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

// ===== Formulario (validación en el navegador) =====
const form = $('#contactForm');
const statusMsg = $('#formStatus');

function setError(field, msg) {
  const box = field.closest('label');
  const out = box && box.querySelector('.error');
  if (out) out.textContent = msg;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  statusMsg.textContent = '';
  statusMsg.classList.remove('ok');

  const { nombre, email, telefono, mensaje, privacidad } = form.elements;
  let valid = true;

  [nombre, email, telefono, privacidad].forEach(f => setError(f, ''));

  if (nombre.value.trim().length < 2) { setError(nombre, 'Escribe tu nombre.'); valid = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { setError(email, 'Introduce un email válido.'); valid = false; }
  if (telefono.value && !/^[+\d\s().-]{7,}$/.test(telefono.value)) { setError(telefono, 'Teléfono no válido.'); valid = false; }
  if (!privacidad.checked) { setError(privacidad, 'Debes aceptar la política de privacidad.'); valid = false; }

  if (!valid) return;

  /*
    AQUÍ conectaré el envío real:
    1) Formspree / EmailJS / Web3Forms (sin backend), o
    2) Mi propio backend (PHP, Node o Python) con fetch('/api/contacto', { method: 'POST', body: ... }).
    Mientras tanto se abre el cliente de correo como solución provisional.
  */
  const subject = encodeURIComponent(`Solicitud de propuesta: ${nombre.value}`);
  const body = encodeURIComponent(
    `Nombre: ${nombre.value}\nEmail: ${email.value}\nTeléfono: ${telefono.value || '-'}\n\n${mensaje.value}`
  );
  window.location.href = `mailto:info.agency@creactivamd.es?subject=${subject}&body=${body}`;

  statusMsg.textContent = '¡Gracias! Se abrirá tu correo para enviar la solicitud.';
  statusMsg.classList.add('ok');
  form.reset();
});