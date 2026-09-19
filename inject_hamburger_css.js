const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const styleHtml = `
<style>
/* Hamburger Menu Standalone Styles */
.mobile-menu-btn { display: none; background: transparent; border: 1px solid var(--border-color, #232738); color: var(--text-main, #fff); padding: 8px 12px; border-radius: 8px; font-size: 1.2rem; cursor: pointer; }
.mobile-dropdown { display: none; position: absolute; top: 100%; left: 0; right: 0; background: #11131e; border-bottom: 1px solid #232738; padding: 15px 20px; flex-direction: column; gap: 12px; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.6); }
.mobile-dropdown.active { display: flex !important; }
.mobile-dropdown a { color: #fff; text-decoration: none; font-size: 0.95rem; font-weight: 600; display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
@media screen and (max-width: 768px) {
  .mobile-menu-btn { display: inline-flex !important; align-items: center; justify-content: center; }
  .nav-links, .nav-menu { display: none !important; }
  header, nav, .navbar, .top-bar { overflow-x: clip !important; overflow-y: visible !important; }
}
@media screen and (min-width: 769px) {
  .mobile-dropdown { display: none !important; }
}
</style>
`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('Hamburger Menu Standalone Styles')) {
    content = content.replace('</head>', styleHtml + '</head>');
    fs.writeFileSync(f, content);
  }
});

console.log("Injected hamburger standalone CSS.");
