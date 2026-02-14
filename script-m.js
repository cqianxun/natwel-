(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const metrics = Array.from(document.querySelectorAll('.metric__number'));

  const renderFinalValue = (el) => {
    const target = Number(el.dataset.target || 0);
    const suffix = el.dataset.suffix || '';
    el.textContent = `${target}${suffix}`;
  };

  const animateValue = (el) => {
    const target = Number(el.dataset.target || 0);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = `${current}${suffix}`;

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const revealOnIntersect = (selector, className, threshold) => {
    const el = document.querySelector(selector);
    if (!el) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      el.classList.add(className);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add(className);
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
  };

  if (metrics.length) {
    if (prefersReducedMotion) {
      metrics.forEach(renderFinalValue);
    } else {
      let done = false;
      const capability = document.querySelector('.capability');

      if (!capability || !('IntersectionObserver' in window)) {
        metrics.forEach(animateValue);
      } else {
        const metricObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !done) {
                done = true;
                metrics.forEach(animateValue);
                metricObserver.disconnect();
              }
            });
          },
          { threshold: 0.35 }
        );
        metricObserver.observe(capability);
      }
    }
  }

  revealOnIntersect('.process-reveal', 'is-visible', 0.25);
  revealOnIntersect('.quality-reveal', 'is-visible', 0.25);

  const faqItems = Array.from(document.querySelectorAll('.faq-item'));
  faqItems.forEach((item) => {
    const button = item.querySelector('.faq-item__question');
    const answer = item.querySelector('.faq-item__answer');
    if (!button || !answer) return;

    if (item.classList.contains('is-open')) {
      button.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }

    button.addEventListener('click', () => {
      const opened = item.classList.contains('is-open');

      faqItems.forEach((other) => {
        const b = other.querySelector('.faq-item__question');
        const a = other.querySelector('.faq-item__answer');
        other.classList.remove('is-open');
        if (b) b.setAttribute('aria-expanded', 'false');
        if (a) a.style.maxHeight = '0px';
      });

      if (!opened) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
})();
