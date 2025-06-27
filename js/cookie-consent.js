// js/cookie-consent.js
// js/cookie-consent.js

export function initCookieConsent() {
  if (localStorage.getItem("cookieConsent")) return;

  const consentBox = document.createElement("div");
  consentBox.className = "cookie-consent";
  consentBox.innerHTML = `
    <div class="cookie-text">
      <h3>Cookie Consent</h3>
      <p>We use cookies and similar technologies to help personalize content, tailor and measure ads, and provide a better experience. By clicking 'Accept', you agree to this use of cookies and data.</p>
    </div>
    <div class="cookie-buttons">
      <button class="cookie-btn reject-cookies" id="rejectCookies">Reject All</button>
      <button class="cookie-btn accept-cookies" id="acceptCookies">Accept All</button>
    </div>
  `;

  document.body.appendChild(consentBox);

  document.getElementById("acceptCookies").addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "accepted");
    consentBox.style.transform = "translateY(100%)";
    setTimeout(() => consentBox.remove(), 500);
  });

  document.getElementById("rejectCookies").addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "rejected");
    consentBox.style.transform = "translateY(100%)";
    setTimeout(() => consentBox.remove(), 500);
  });
}
