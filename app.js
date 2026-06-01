document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordion();
  initScrollReveal();
  initPurchaseModal();
  initInfoModal();
});

/**
 * Inicializa el acordeón interactivo para las preguntas frecuentes (FAQ)
 */
function initFaqAccordion() {
  const faqHeaders = document.querySelectorAll('.faq-header');

  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.faq-body');
      const isActive = item.classList.contains('active');

      // Cerrar todos los demás items (comportamiento clásico de acordeón)
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-body').style.maxHeight = null;
        }
      });

      // Alternar el item actual
      if (isActive) {
        item.classList.remove('active');
        body.style.maxHeight = null;
      } else {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/**
 * Inicializa las animaciones de aparición al hacer scroll (Scroll Reveal)
 */
function initScrollReveal() {
  const selectorsToReveal = [
    '.pain-card',
    '.feature-card',
    '.pricing-card',
    '.faq-item',
    '.hero-image-container',
    '.hero-content h1',
    '.hero-content p',
    '.hero-bullets',
    '.hero-cta-box'
  ];

  selectorsToReveal.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('reveal');
    });
  });

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    const visibleEntries = entries.filter(entry => entry.isIntersecting);
    
    visibleEntries.forEach((entry, index) => {
      const el = entry.target;
      if (el.classList.contains('pain-card') || el.classList.contains('feature-card') || el.classList.contains('pricing-card')) {
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 150);
      } else {
        el.classList.add('visible');
      }
      observer.unobserve(el);
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

/**
 * Inicializa el comportamiento del modal de compra y cálculo de subtotales
 */
function initPurchaseModal() {
  const modal = document.getElementById('purchase-modal');
  const btnClose = document.getElementById('btn-close-modal');
  const btnConfirm = document.getElementById('btn-confirm-purchase');
  const inputName = document.getElementById('client-name');
  const nameError = document.getElementById('name-error');
  const radioTiers = document.querySelectorAll('input[name="worker-tier"]');
  const valAdditional = document.getElementById('val-additional');
  const valTotal = document.getElementById('val-total');

  const BASE_PRICE = 25;

  // Interceptar todos los enlaces de WhatsApp para abrir el modal
  const buyButtons = document.querySelectorAll('a[href*="wa.me"]');
  buyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Siempre pre-seleccionar la opción básica de 10 trabajadores ($25)
      selectRadioTier('10');

      openModal();
    });
  });

  // Evento para abrir el modal
  function openModal() {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Evita scroll de fondo
    inputName.focus();
  }

  // Evento para cerrar el modal
  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    // Limpiar errores e inputs al cerrar
    nameError.style.display = 'none';
    inputName.value = '';
  }

  // Cerrar con botón X
  btnClose.addEventListener('click', closeModal);

  // Cerrar al hacer clic fuera del modal container
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Pre-seleccionar opción por JS
  function selectRadioTier(value) {
    const radio = document.querySelector(`input[name="worker-tier"][value="${value}"]`);
    if (radio) {
      radio.checked = true;
      updatePricingBreakdown(radio);
    }
  }

  // Escuchar cambio de opción de trabajadores
  radioTiers.forEach(radio => {
    radio.addEventListener('change', () => {
      updatePricingBreakdown(radio);
    });
  });

  // Recalcular precios dinámicamente y actualizar estilos visuales
  function updatePricingBreakdown(selectedRadio) {
    // Quitar la clase selected de todas las tarjetas
    document.querySelectorAll('.option-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Agregar la clase selected a la tarjeta elegida
    const card = selectedRadio.closest('.option-card');
    if (card) {
      card.classList.add('selected');
    }

    const additionalCost = parseFloat(selectedRadio.getAttribute('data-add'));
    const totalCost = BASE_PRICE + additionalCost;

    // Actualizar textos en la interfaz
    valAdditional.textContent = `+$${additionalCost.toFixed(2)}`;
    valTotal.textContent = `$${totalCost.toFixed(2)}`;
  }

  // Confirmar y Enviar a WhatsApp
  btnConfirm.addEventListener('click', () => {
    const name = inputName.value.trim();
    
    // Validación de Nombre
    if (!name) {
      nameError.style.display = 'block';
      inputName.focus();
      return;
    }
    nameError.style.display = 'none';

    // Obtener la opción de trabajadores seleccionada
    const selectedRadio = document.querySelector('input[name="worker-tier"]:checked');
    const workers = selectedRadio.value;
    const additional = parseFloat(selectedRadio.getAttribute('data-add'));
    const total = BASE_PRICE + additional;

    // Número de teléfono de WhatsApp (puedes cambiarlo por el oficial en producción)
    const phoneNumber = '584120000000'; 
    
    // Construir mensaje estructurado para conversión
    const message = `Hola! Mi nombre es *${name}*.\n\n` +
                    `Me interesa adquirir el *Kit de Nómina en Excel* adaptado a la LOTTT.\n` +
                    `• Capacidad: *${workers} Trabajadores*\n` +
                    `• Precio Base: *$25.00*\n` +
                    `• Adicional por Capacidad: *+$${additional.toFixed(2)}*\n` +
                    `• *Monto Total a Pagar: $${total.toFixed(2)}*\n\n` +
                    `Por favor, indíquenme los métodos de pago disponibles para completar mi compra. ¡Muchas gracias!`;

    // URL de WhatsApp Web / App
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Registrar conversión en consola
    console.log(`Conversión registrada para: ${name}. Plan: ${workers} trabajadores. Total: $${total}`);

    // Abrir WhatsApp en pestaña nueva
    window.open(whatsappUrl, '_blank');

    // Cerrar modal
    closeModal();
  });
}

/**
 * Inicializa el comportamiento del modal de información para las políticas y términos del footer
 */
function initInfoModal() {
  const modal = document.getElementById('info-modal');
  const btnClose = document.getElementById('btn-close-info-modal');
  const title = document.getElementById('info-modal-title');
  const body = document.getElementById('info-modal-body');

  const linkPrivacy = document.getElementById('link-privacy');
  const linkTerms = document.getElementById('link-terms');

  const content = {
    privacy: {
      title: 'Política de Privacidad',
      html: `
        <h4 style="font-weight: 700; color: var(--color-primary); margin-bottom: 8px;">1. Tratamiento de Datos Personales</h4>
        <p style="margin-bottom: 16px;">En Gehydis, valoramos y respetamos tu privacidad. Toda la información suministrada de forma voluntaria en este sitio web (como tu nombre y las selecciones de tu cotización) tiene como única finalidad preparar y personalizar el mensaje de tu pedido para ser despachado a través de WhatsApp. No almacenamos tus datos personales en servidores externos ni los compartimos con terceros.</p>
        
        <h4 style="font-weight: 700; color: var(--color-primary); margin-bottom: 8px;">2. Contacto Directo</h4>
        <p style="margin-bottom: 16px;">La transacción final y el soporte técnico postventa se ejecutan exclusivamente a través del canal oficial de WhatsApp. Tus datos de contacto serán tratados con absoluta confidencialidad en el marco exclusivo del soporte de implementación de la herramienta.</p>

        <h4 style="font-weight: 700; color: var(--color-primary); margin-bottom: 8px;">3. Cookies y Seguridad</h4>
        <p>Este sitio web utiliza cookies técnicas básicas únicamente para garantizar el correcto funcionamiento del modal y el cálculo de precios interactivo. Al interactuar con el sitio, manifiestas tu conformidad.</p>
      `
    },
    terms: {
      title: 'Términos de Servicio',
      html: `
        <h4 style="font-weight: 700; color: var(--color-primary); margin-bottom: 8px;">1. Licencia de Uso</h4>
        <p style="margin-bottom: 16px;">El Kit de Nómina en Excel es una herramienta desarrollada de manera independiente por Gehydis para facilitar la gestión administrativa en Venezuela de acuerdo a la LOTTT. Al comprar la herramienta, el usuario adquiere una licencia de uso personal y comercial permanente, de pago único, sin suscripciones mensuales.</p>
        
        <h4 style="font-weight: 700; color: var(--color-primary); margin-bottom: 8px;">2. Limitación de Responsabilidad</h4>
        <p style="margin-bottom: 16px;">La correcta configuración de los datos históricos de los empleados, parámetros especiales y la inserción de datos en la hoja de cálculo es responsabilidad directa y exclusiva del comprador. Gehydis no se hace responsable por pérdidas de información o multas derivadas de alteraciones accidentales en las fórmulas originales de Excel realizadas por el usuario final tras la entrega.</p>

        <h4 style="font-weight: 700; color: var(--color-primary); margin-bottom: 8px;">3. Propiedad Intelectual y Reventa</h4>
        <p>Queda terminantemente prohibida la redistribución, copia comercial, reventa o publicación de las plantillas en plataformas web de distribución masiva sin la autorización explícita por escrito de Gehydis. El producto es para uso operativo del adquirente.</p>
      `
    }
  };

  // Evento para abrir modal de Privacidad
  if (linkPrivacy) {
    linkPrivacy.addEventListener('click', (e) => {
      e.preventDefault();
      openInfo(content.privacy);
    });
  }

  // Evento para abrir modal de Términos
  if (linkTerms) {
    linkTerms.addEventListener('click', (e) => {
      e.preventDefault();
      openInfo(content.terms);
    });
  }

  function openInfo(data) {
    title.textContent = data.title;
    body.innerHTML = data.html;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeInfo() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  if (btnClose) {
    btnClose.addEventListener('click', closeInfo);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeInfo();
    }
  });
}
