const categoryLabels = { alimentacao: 'Alimentação', higiene: 'Higiene', brinquedos: 'Brinquedos', acessorios: 'Acessórios' };

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.site-header').forEach((header) => {
  const button = header.querySelector('.menu-toggle');
  const menu = header.querySelector('.site-nav');

  const syncHeaderState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });

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

const revealCandidates = [
  ...document.querySelectorAll('.page-intro, .content-section > :not(.product-grid), .contact-card, .booking-wizard')
];

revealCandidates.forEach((element, index) => {
  element.classList.add('reveal');
  element.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 70}ms`);
});

const revealVisible = (element) => element.classList.add('is-visible');

if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealVisible(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

  revealCandidates.forEach((element) => revealObserver.observe(element));
} else {
  revealCandidates.forEach(revealVisible);
}

const productGrid = document.querySelector('[data-product-grid]');
if (productGrid && Array.isArray(window.products)) {
  const count = document.querySelector('[data-product-count]');
  let activeCategory = 'todos';
  let filterLocked = false;

  const buildProductCard = (product, index) => `<article class="card product-card reveal" data-category="${product.category}" style="--reveal-delay:${Math.min(index, 5) * 60}ms"><img src="${product.image}" width="500" height="500" loading="lazy" alt="${product.alt}"><div class="card-body"><p class="product-category">${categoryLabels[product.category]}</p><h2>${product.name}</h2><p>${product.description}</p><div class="product-footer"><strong>${product.price}</strong><a class="button button-small" href="https://wa.me/?text=${encodeURIComponent(`Olá! Tenho interesse em ${product.name}.`)}" target="_blank" rel="noopener noreferrer" aria-label="Comprar ${product.name} pelo WhatsApp">Comprar</a></div></div></article>`;

  const hydrateCardReveals = () => {
    const cards = [...productGrid.querySelectorAll('.product-card.reveal')];
    if (reduceMotion || !('IntersectionObserver' in window)) {
      cards.forEach(revealVisible);
      return;
    }

    const cardObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealVisible(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

    cards.forEach((card) => cardObserver.observe(card));
  };

  const renderProducts = (category = 'todos') => {
    activeCategory = category;
    const visibleProducts = category === 'todos'
      ? window.products
      : window.products.filter((product) => product.category === category);

    productGrid.innerHTML = visibleProducts.map(buildProductCard).join('');
    if (count) {
      count.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? 'item encontrado' : 'itens encontrados'}`;
    }
    hydrateCardReveals();
  };

  const applyFilter = (filter) => {
    if (filterLocked || filter.dataset.filter === activeCategory) return;

    filterLocked = true;
    document.querySelectorAll('[data-filter]').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === filter));
    });

    const nextCategory = filter.dataset.filter;
    const finish = () => {
      renderProducts(nextCategory);
      productGrid.classList.remove('is-filtering');
      filterLocked = false;
    };

    if (reduceMotion) {
      finish();
      return;
    }

    productGrid.classList.add('is-filtering');
    window.setTimeout(finish, 160);
  };

  document.querySelectorAll('[data-filter]').forEach((filter) => {
    filter.addEventListener('click', () => applyFilter(filter));
  });

  renderProducts();
}

const bookingForm = document.querySelector('[data-booking-form]');
if (bookingForm) {
  const steps = [...bookingForm.querySelectorAll('[data-step]')];
  const progress = bookingForm.querySelector('[data-progress]');
  let currentStep = 0;

  const showStep = (index, direction = 'forward') => {
    const previousStep = steps[currentStep];
    const nextStep = steps[index];
    if (previousStep && previousStep !== nextStep && !reduceMotion) {
      previousStep.classList.remove('step-enter', 'step-enter-back');
      previousStep.classList.add(direction === 'back' ? 'step-exit-back' : 'step-exit');
      window.setTimeout(() => previousStep.classList.remove('step-exit', 'step-exit-back'), 220);
    }

    currentStep = index;
    steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== index; });

    if (nextStep && !reduceMotion) {
      nextStep.classList.remove('step-exit', 'step-exit-back');
      nextStep.classList.add(direction === 'back' ? 'step-enter-back' : 'step-enter');
      window.setTimeout(() => nextStep.classList.remove('step-enter', 'step-enter-back'), 280);
    }
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
  bookingForm.querySelector('[data-next]').addEventListener('click', () => { if (validStep()) showStep(currentStep + 1, 'forward'); });
  bookingForm.querySelector('[data-back]').addEventListener('click', () => showStep(currentStep - 1, 'back'));

  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(bookingForm);
    const message = `Olá! Gostaria de agendar um atendimento.\n\nServiço: ${data.get('servico')}\nPet: ${data.get('pet')}\nTipo: ${data.get('especie')}\nPorte: ${data.get('porte')}\nData: ${data.get('data')}\nHorário: ${data.get('horario')}\nResponsável: ${data.get('nome')}\nTelefone: ${data.get('telefone')}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });

  showStep(0);
}

