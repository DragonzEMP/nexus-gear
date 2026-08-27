const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/<span>NEXUS<\/span>GEAR\./g, '<span>NEXUS</span>GEAR<span class="dot">.</span>');
  fs.writeFileSync(f, content);
});
