// Theme toggle logic
const toggleBtn = document.getElementById('toggleTheme');
const themeIcon = document.getElementById('themeIcon');
const body = document.body;

function setTheme(dark) {
  if (dark) {
    body.classList.add('dark');
    themeIcon.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark');
    themeIcon.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
}

// Load theme preference
const userTheme = localStorage.getItem('theme');
if (userTheme === 'dark' || (userTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  setTheme(true);
} else {
  setTheme(false);
}

toggleBtn.addEventListener('click', () => {
  setTheme(!body.classList.contains('dark'));
});

// Animate cards on load
window.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.ds-card');
  cards.forEach((card, i) => {
    card.style.animationDelay = `${i * 0.06 + 0.2}s`;
  });
  const toggles = document.querySelectorAll('.tree-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
      // Change arrow direction
      this.textContent = (expanded ? '▶' : '▼') + this.textContent.slice(1);
    });
    // Set initial arrow
    btn.textContent = (btn.getAttribute('aria-expanded') === 'true' ? '▼' : '▶') + btn.textContent.slice(1);
  });
  const boxes = document.querySelectorAll('.category-box');
  boxes.forEach(box => {
    const header = box.querySelector('.category-header');
    header.addEventListener('click', function(e) {
      e.stopPropagation();
      // Collapse all other boxes
      boxes.forEach(b => {
        if (b !== box) b.classList.remove('active');
      });
      // Toggle this box
      box.classList.toggle('active');
      // Animate subcategories with staggered delay
      if (box.classList.contains('active')) {
        const subs = box.querySelectorAll('.subcategory');
        subs.forEach((sub, i) => {
          sub.style.animationDelay = `${0.15 + i * 0.12}s`;
          sub.classList.remove('animated');
          // Force reflow for restart
          void sub.offsetWidth;
          sub.classList.add('animated');
        });
      }
    });
  });
}); 