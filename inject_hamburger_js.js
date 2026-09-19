const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const scriptHtml = '\n  <script src="hamburger.js"></script>\n</body>';

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('src="hamburger.js"')) {
    content = content.replace(/<\/body>/g, scriptHtml);
    fs.writeFileSync(f, content);
  }
});

console.log("Injected hamburger script.");
