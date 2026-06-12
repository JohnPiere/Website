/* Set the language class before paint (avoids a flash of the wrong language).
   Kept external so the page can use a strict script-src 'self' CSP. */
try {
  if (localStorage.getItem('ssn-lang') === 'en') {
    document.documentElement.classList.add('en');
    document.documentElement.lang = 'en';
  }
} catch (e) {}
