export function setUpFadeInElementOnScroll(
  options: {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
  } = {}
) {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = false } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    {
      threshold,
      rootMargin,
    }
  );

  const elements = document.querySelectorAll("[data-fade-in]");
  elements.forEach((el) => observer.observe(el));

  return observer;
}

export function setUpFadeInWindowOnScroll(
  options: {
    scrollThreshold?: number;
    addClass?: string;
    attribute?: string;
  } = {}
) {
  const {
    scrollThreshold = 100,
    addClass = "is-visible",
    attribute = "[window-scroll-fade]",
  } = options;

  let hasTriggered = false;

  const handleScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const elements = document.querySelectorAll(attribute);
    if (scrollY >= scrollThreshold) {
      if (!hasTriggered) {
        // ← 既に表示済みなら何もしない
        elements.forEach((el) => {
          el.classList.add(addClass);
        });
        hasTriggered = true;
      }
    } else {
      if (hasTriggered) {
        // ← 既に非表示なら何もしない
        elements.forEach((el) => {
          el.classList.remove(addClass);
        });
        hasTriggered = false;
      }
    }
  };

  window.addEventListener("scroll", handleScroll);

  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}
