(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const maybeMojibake = (text) => /�|Ã|å|ä|ç|æ|ø|Ö|Ð/.test(text);

  const safeZhCopy = [
    ['#hero-title', '\u7535\u529b\u7cfb\u7edf OEM / ODM \u79fb\u52a8\u7aef\u89e3\u51b3\u65b9\u6848'],
    ['.services__title', '\u670d\u52a1\u6982\u89c8'],
    ['.product-range__title', '\u4ea7\u54c1\u7ec4\u5408'],
    ['.capability__title', '\u5236\u9020\u4e0e\u5de5\u7a0b\u80fd\u529b'],
    ['.process__title', '\u5408\u4f5c\u6d41\u7a0b'],
    ['.customization__title', '\u5b9a\u5236\u80fd\u529b'],
    ['.quality__title', '\u54c1\u8d28\u7ba1\u63a7'],
    ['.market__title', '\u5e94\u7528\u5e02\u573a'],
    ['.faq__title', 'FAQ \u5e38\u89c1\u95ee\u9898'],
    ['.consult__title', '\u9879\u76ee\u54a8\u8be2'],
    ['.compliance__title', '\u8d44\u8d28\u4e0e\u5408\u89c4']
  ];

  const normalizeTextEncoding = () => {
    document.documentElement.setAttribute('lang', 'zh-CN');
    safeZhCopy.forEach(([selector, text]) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const current = (el.textContent || '').trim();
      if (!current || maybeMojibake(current)) {
        el.textContent = text;
      }
    });
  };

  normalizeTextEncoding();

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
