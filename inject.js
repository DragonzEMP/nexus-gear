const fs = require('fs');

const files = ['account.html', 'admin.html', 'category.html', 'checkout.html', 'login.html', 'product.html', 'track.html', 'user-auth.html'];

const footerHTML = `
<style>
/* Footer styles injected for consistency across standalone pages */
.site-footer { background-color: #0b0d14; border-top: 1px solid #232738; padding: 40px 20px 20px; color: #94a3b8; font-family: 'Plus Jakarta Sans', sans-serif;}
.site-footer .container { max-width: 1200px; margin: 0 auto; }
.site-footer .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1.2fr; gap: 30px; }
.site-footer .brand-logo { font-size: 1.6rem; font-weight: 800; color: #fff; text-decoration: none; }
.site-footer .brand-logo span { color: #7c5dfa; }
.site-footer .brand-logo .dot { color: #f4d03f; }
.site-footer p { font-size: 0.9rem; margin-top: 15px; line-height: 1.6; }
.site-footer h4 { font-size: 1.1rem; margin-bottom: 15px; color:#fff;}
.site-footer ul { list-style: none; padding:0; margin:0;}
.site-footer li { margin-bottom: 10px; }
.site-footer a { color: #94a3b8; font-size: 0.95rem; text-decoration:none; transition: color 0.2s;}
.site-footer a:hover { color: #7c5dfa; }
.site-footer .footer-bottom { border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 20px; margin-top: 40px; font-size: 0.85rem; display:flex; justify-content:space-between; align-items:center; }
.site-footer .payment-icons span { margin-left: 10px; font-size: 1rem; }
@media (max-width: 768px) {
  .site-footer .footer-grid { grid-template-columns: 1fr; gap: 30px; }
  .site-footer .footer-bottom .container { flex-direction:column; gap:15px; text-align:center; justify-content:center !important;}
}
</style>
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-about">
      <a href="index.html" class="brand-logo"><span>NEXUS</span>GEAR<span class="dot">.</span></a>
      <p>Nexus Gear is your premier store for high-performance gaming gear, custom mechanical keyboards, precision mice, and desk setup accessories in Bangladesh. Elevate Your Play.</p>
    </div>
    <div class="footer-links">
      <h4>Quick Links</h4>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="index.html#categories">Categories</a></li>
        <li><a href="track.html">Track Order</a></li>
        <li><a href="account.html">My Account</a></li>
      </ul>
    </div>
    <div class="footer-contact">
      <h4>Physical Showrooms</h4>
      <p>📍 Multiplan Center, Elephant Road, Dhaka</p>
      <p>📞 Hotline: 01819-940370</p>
      <p>📧 Support: support@nexusgear.com</p>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container" style="display:flex; justify-content:space-between; width:100%; flex-wrap:wrap; gap:10px;">
      <p style="margin:0;">&copy; 2026 Nexus Gear. All rights reserved. | Designed & Developed by <strong>DragonzEMP</strong></p>
      <div class="payment-icons">
        <span>💳 VISA</span>
        <span>💳 Mastercard</span>
        <span>💰 Cash on Delivery</span>
      </div>
    </div>
  </div>
</footer>
`;

let modifiedCount = 0;
files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('<footer class="site-footer">')) {
      if (content.includes('<script')) {
        const lastScriptIndex = content.lastIndexOf('<script');
        content = content.slice(0, lastScriptIndex) + footerHTML + '\n  ' + content.slice(lastScriptIndex);
      } else {
        const bodyEndIndex = content.indexOf('</body>');
        if (bodyEndIndex !== -1) {
          content = content.slice(0, bodyEndIndex) + footerHTML + '\n' + content.slice(bodyEndIndex);
        } else {
          content += '\n' + footerHTML;
        }
      }
      fs.writeFileSync(file, content);
      modifiedCount++;
      console.log('Injected footer into', file);
    }
  }
});
console.log('Done. Modified', modifiedCount, 'files.');
