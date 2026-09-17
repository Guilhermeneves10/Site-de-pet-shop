const categoryLabels = { alimentacao: 'Alimentação', higiene: 'Higiene', brinquedos: 'Brinquedos', acessorios: 'Acessórios' };

document.querySelectorAll('.site-header').forEach((header) => {
  const button = header.querySelector('.menu-toggle');
  const menu = header.querySelector('.site-nav');
  if (!button || !menu) return;
  button.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
    button.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menu.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Abrir menu');
  }));
});

const productGrid = document.querySelector('[data-product-grid]');
if (productGrid && Array.isArray(window.products)) {
  const renderProducts = (category = 'todos') => {
    const visibleProducts = category === 'todos' ? window.products : window.products.filter((product) => product.category === category);
    productGrid.innerHTML = visibleProducts.map((product) => `<article class="card product-card"><img src="${product.image}" width="500" height="500" loading="lazy" alt="${product.alt}"><div class="card-body"><p class="product-category">${categoryLabels[product.category]}</p><h2>${product.name}</h2><p>${product.description}</p><div class="product-footer"><strong>${product.price}</strong><a class="button button-small" href="https://wa.me/?text=${encodeURIComponent(`Olá! Tenho interesse em ${product.name}.`)}" target="_blank" rel="noopener noreferrer" aria-label="Comprar ${product.name} pelo WhatsApp">Comprar</a></div></div></article>`).join('');
    const count = document.querySelector('[data-product-count]');
    if (count) count.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? 'item encontrado' : 'itens encontrados'}`;
  };
  document.querySelectorAll('[data-filter]').forEach((filter) => filter.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach((item) => item.setAttribute('aria-pressed', 'false'));
    filter.setAttribute('aria-pressed', 'true');
    renderProducts(filter.dataset.filter);
  }));
  renderProducts();
}

const bookingForm = document.querySelector('[data-booking-form]');
if (bookingForm) {
  const steps = [...bookingForm.querySelectorAll('[data-step]')];
  const progress = bookingForm.querySelector('[data-progress]');
  let currentStep = 0;
  const showStep = (index) => {
    currentStep = index;
    steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== index; });
    progress.textContent = `Etapa ${index + 1} de ${steps.length}`;
    bookingForm.querySelector('[data-back]').hidden = index === 0;
    bookingForm.querySelector('[data-next]').hidden = index === steps.length - 1;
    bookingForm.querySelector('[data-submit]').hidden = index !== steps.length - 1;
    if (index === steps.length - 1) {
      const data = new FormData(bookingForm);
      bookingForm.querySelector('[data-summary]').innerHTML = `<li><strong>Serviço:</strong> ${data.get('servico')}</li><li><strong>Pet:</strong> ${data.get('pet')} (${data.get('porte')})</li><li><strong>Data e horário:</strong> ${data.get('data')} às ${data.get('horario')}</li><li><strong>Responsável:</strong> ${data.get('nome')} — ${data.get('telefone')}</li>`;
    }
  };
  const validStep = () => [...steps[currentStep].querySelectorAll('[required]')].every((input) => input.reportValidity());
  bookingForm.querySelector('[data-next]').addEventListener('click', () => { if (validStep()) showStep(currentStep + 1); });
  bookingForm.querySelector('[data-back]').addEventListener('click', () => showStep(currentStep - 1));
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(bookingForm);
    const message = `Olá! Gostaria de agendar um atendimento.\n\nServiço: ${data.get('servico')}\nPet: ${data.get('pet')}\nTipo: ${data.get('especie')}\nPorte: ${data.get('porte')}\nData: ${data.get('data')}\nHorário: ${data.get('horario')}\nResponsável: ${data.get('nome')}\nTelefone: ${data.get('telefone')}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });
  showStep(0);
}
