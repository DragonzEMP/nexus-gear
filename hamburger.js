// Toggle Mobile Navigation Menu
function toggleMobileMenu(event) {
  if (event) event.stopPropagation(); // Prevents click from bubbling away
  const dropdown = document.getElementById('mobile-nav-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
  }
}

// Close mobile dropdown if user clicks anywhere outside of it
document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('mobile-nav-dropdown');
  const menuBtn = document.querySelector('.mobile-menu-btn');
  if (dropdown && dropdown.classList.contains('active')) {
    if (!dropdown.contains(e.target) && (!menuBtn || !menuBtn.contains(e.target))) {
      dropdown.classList.remove('active');
    }
  }
});
