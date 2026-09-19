const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const buttonHtml = '<button class="mobile-menu-btn" onclick="toggleMobileMenu(event)"><i class="fa-solid fa-bars"></i></button>\n      ';
const dropdownHtml = `
  <!-- Mobile Navigation Dropdown -->
  <div class="mobile-dropdown" id="mobile-nav-dropdown">
    <a href="index.html"><i class="fa-solid fa-house"></i> Home</a>
    <a href="index.html#categories"><i class="fa-solid fa-layer-group"></i> Categories</a>
    <a href="index.html#new-arrivals"><i class="fa-solid fa-fire"></i> Trends</a>
    <a href="index.html#featured"><i class="fa-solid fa-star"></i> Featured</a>
    <a href="admin.html"><i class="fa-solid fa-bolt"></i> Admin</a>
    <a href="track.html"><i class="fa-solid fa-location-dot"></i> Track Order</a>
  </div>
`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Insert button before brand-logo if not already there
  if (!content.includes('mobile-menu-btn')) {
    content = content.replace(/(<a href="index\.html" class="brand-logo">)/g, buttonHtml + '$1');
  }

  // Insert dropdown right before </header> if not already there
  if (!content.includes('mobile-nav-dropdown')) {
    content = content.replace(/(<\/header>)/g, dropdownHtml + '$1');
  }

  fs.writeFileSync(f, content);
});

console.log("Injected hamburger menu successfully.");
