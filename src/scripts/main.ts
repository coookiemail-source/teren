const trigger = document.querySelector<HTMLButtonElement>('.menu-toggle');
const dialog = document.querySelector<HTMLDialogElement>('#mobile-menu');
if (trigger && dialog) {
  const close = () => dialog.close();
  trigger.addEventListener('click', () => {
    dialog.showModal();
    trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  });
  dialog.querySelector('.menu-close')?.addEventListener('click', close);
  dialog.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    trigger.focus();
  });
  matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches && dialog.open) close(); });
}
const projectLinks = document.querySelectorAll<HTMLAnchorElement>('[data-project-link]');
if (projectLinks.length) {
  projectLinks[0].classList.add('active');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      projectLinks.forEach(link => {
        const active = link.dataset.projectLink === (entry.target as HTMLElement).dataset.project;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-20% 0px -40% 0px' });
  document.querySelectorAll('[data-project]').forEach(project => observer.observe(project));
}
const form = document.querySelector<HTMLFormElement>('#contact-form');
const fields = document.querySelector<HTMLFieldSetElement>('#contact-fields');
if (fields) fields.disabled = false;
if (form) form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const status = document.querySelector<HTMLElement>('#form-status');
  if (status) { status.hidden = false; status.textContent = 'Демонстрация завершена. Данные проверены, но никуда не отправлены и не сохранены.'; status.focus(); }
});
