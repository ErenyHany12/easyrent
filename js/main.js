import API from "./api.js";
import { initCookieConsent } from "./cookie-consent.js";
import { initNavigation } from "./navigation.js";
import { initFilter } from "./property-filter.js";

// إنشاء نسخة من API class مع التوكن لو موجود
const api = new API("https://easyrentapi0.runasp.net", {
  authToken: localStorage.getItem("token"),
});

// التحقق من نوع المستخدم وتوجيهه للصفحة المناسبة
async function checkUserType() {
  try {
    const user = await api.get("/auth/me");
    console.log("نوع المستخدم:", user.role);

    if (user.role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else if (user.role === "owner") {
      window.location.href = "owner-dashboard.html";
    } else if (user.role === "student") {
      window.location.href = "student-dashboard.html";
    } else {
      alert("نوع المستخدم غير معروف، سيتم تسجيل الخروج");
      localStorage.removeItem("token");
      window.location.href = "login.html";
    }
  } catch (err) {
    console.error("فشل في التحقق من نوع المستخدم", err);
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
}

// دالة عرض الوحدات من API
async function displayUnits() {
  const propertyGrid = document.getElementById("property-grid");
  if (!propertyGrid) {
    console.warn("Property grid element not found");
    return;
  }

  propertyGrid.innerHTML = `
    <div class="loading-state">
      <i class="ri-loader-4-line spin"></i>
      <p>جاري تحميل الوحدات...</p>
    </div>
  `;

  try {
    const response = await api.get("/api/Unit/GetAllUnits");
    const units = response.$values || [];

    if (!units.length) {
      propertyGrid.innerHTML = `
        <div class="no-results">
          <i class="ri-home-4-line"></i>
          <h3>لا توجد وحدات متاحة حالياً</h3>
        </div>
      `;
      return;
    }

    propertyGrid.innerHTML = "";
    units.forEach((unit) => {
      propertyGrid.appendChild(createUnitCard(unit));
    });
  } catch (error) {
    propertyGrid.innerHTML = `
      <div class="error-state">
        <i class="ri-error-warning-line"></i>
        <h3>حدث خطأ في تحميل البيانات</h3>
        <p>${error.message || "الرجاء المحاولة مرة أخرى"}</p>
      </div>
    `;
    console.error("Fetch error:", error);
  }
}

// دالة إنشاء بطاقة الوحدة (محدثة لتتناسب مع هيكل البيانات الجديد)
function createUnitCard(unit) {
  const card = document.createElement("div");
  card.className = "property-card";

  const mainImage = unit.photoUrls?.$values?.[0]
    ? `https://easyrentapi0.runasp.net/${unit.photoUrls.$values[0]}`
    : "images/default-unit.jpg";

  card.innerHTML = `
    <div class="property-image" style="background-image: url('${mainImage}')">
      ${
        unit.status === "Approved"
          ? '<span class="approved-badge">موافق عليه</span>'
          : ""
      }
    </div>
    <div class="property-price">${
      unit.priceForMonth?.toLocaleString() || "0"
    } ج.م/شهر</div>
    <div class="property-details">
      <h3>${unit.title || "وحدة سكنية"}</h3>
      <p class="property-location">
        <i class="ri-map-pin-line"></i> ${unit.address || "العنوان غير متوفر"}
      </p>
      <div class="property-features">
        <span class="feature-item">
          <i class="ri-user-line"></i>
          <span class="feature-value">${
            unit.ownerName || "مالك غير معروف"
          }</span>
        </span>
      </div>
      <div class="property-actions">
        <button class="btn view-details" data-unit-id="${unit.id}">
          <i class="ri-eye-line"></i> عرض التفاصيل
        </button>
      </div>
    </div>
  `;

  const viewBtn = card.querySelector(".view-details");
  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      window.location.href = `unit-details.html?id=${unit.id}`;
    });
  }

  return card;
}

// أنماط إضافية للبطاقات
const unitStyles = document.createElement("style");
unitStyles.textContent = `
  .property-image {
    position: relative;
  }
  
  .approved-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: var(--primary-color);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
  
  .property-actions {
    margin-top: 15px;
  }
  
  .property-actions .btn {
    width: 100%;
    text-align: center;
    padding: 8px;
    font-size: 14px;
  }
  
  .property-price {
    background: var(--primary-color);
    color: white;
  }
`;
document.head.appendChild(unitStyles);
// استدعاء تهيئة الإضافات
initCookieConsent();
initNavigation();
initFilter();

document.addEventListener("DOMContentLoaded", async () => {
  // ======= TOGGLE MENU =======
  const menuBtn = document.getElementById("menu-btn");
  const navRightItems = document.querySelector(".nav-right-items");

  if (menuBtn && navRightItems) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navRightItems.classList.toggle("open");
      document.body.style.overflow = navRightItems.classList.contains("open")
        ? "hidden"
        : "auto";
    });

    navRightItems.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navRightItems.classList.remove("open");
        document.body.style.overflow = "auto";
      });
    });

    document.addEventListener("click", (e) => {
      if (
        !navRightItems.contains(e.target) &&
        !menuBtn.contains(e.target) &&
        navRightItems.classList.contains("open")
      ) {
        navRightItems.classList.remove("open");
        document.body.style.overflow = "auto";
      }
    });
  }

  // ---- ScrollReveal Animations ----
  if (typeof ScrollReveal !== "undefined") {
    const sr = ScrollReveal({
      distance: "50px",
      origin: "bottom",
      duration: 1000,
    });

    sr.reveal(".header__container h1", { delay: 500 });
    sr.reveal(".header__container .section__subheader", { delay: 250 });
    sr.reveal(".header__container .btn", { delay: 1000 });
    sr.reveal(".room__card", { interval: 500 });
    sr.reveal(".feature__card", { interval: 500 });
  }

  // عرض الوحدات من API
  await displayUnits();

  // ---- Feature Cards ----
  const featureCards = document.querySelectorAll(".feature__card");
  featureCards.forEach((card) => {
    card.style.cursor = "pointer";

    card.addEventListener("click", function () {
      const pageUrl = this.dataset.page;
      if (pageUrl) {
        window.location.href = pageUrl;
      }
    });

    card.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.03)";
      this.style.transition = "transform 0.2s ease";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
    });
  });

  // ---- Theme Switcher ----
  const themeSwitch = document.querySelector('.switch input[type="checkbox"]');
  if (themeSwitch) {
    document.documentElement.setAttribute("data-theme", "light");
    themeSwitch.checked = false;
    localStorage.setItem("theme", "light");

    function switchTheme(e) {
      if (e.target.checked) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
      }
    }

    themeSwitch.addEventListener("change", switchTheme, false);
  }

  // ---- Filter Controls ----
  const forRentSelect = document.getElementById("forRent");
  const currencySelect = document.getElementById("currency");
  const areaUnitSelect = document.getElementById("areaUnit");
  const bathroomSelect = document.getElementById("bathroomCount");
  const bedroomSelect = document.getElementById("bedroomCount");
  const kitchenSelect = document.getElementById("kitchenCount");
  const resetBtn = document.getElementById("resetFilter");
  const applyBtn = document.getElementById("applyFilter");

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (forRentSelect) forRentSelect.value = "rent";
      if (currencySelect) currencySelect.value = "euro";
      if (areaUnitSelect) areaUnitSelect.value = "sqft";
      if (bathroomSelect) bathroomSelect.value = "";
      if (bedroomSelect) bedroomSelect.value = "";
      if (kitchenSelect) kitchenSelect.value = "";
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      const filters = {
        purpose: forRentSelect ? forRentSelect.value : "",
        currency: currencySelect ? currencySelect.value : "",
        areaUnit: areaUnitSelect ? areaUnitSelect.value : "",
        bathroomCount: bathroomSelect ? bathroomSelect.value : "",
        bedroomCount: bedroomSelect ? bedroomSelect.value : "",
        kitchenCount: kitchenSelect ? kitchenSelect.value : "",
      };
      console.log("تطبيق الفلاتر:", filters);
    });
  }

  // ---- Toggle filter section ----
  function toggleSection(header) {
    const section = header.parentElement;
    const content = section.querySelector(".filter-content");
    header.classList.toggle("collapsed");

    if (content.style.maxHeight) {
      content.style.maxHeight = null;
      content.classList.remove("collapsed");
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      content.classList.add("collapsed");
    }
  }

  document.querySelectorAll(".filter-header").forEach((header) => {
    header.addEventListener("click", () => toggleSection(header));
  });

  // أنماط الوحدات
  const style = document.createElement("style");
  style.textContent = `
    .loading-state, .error-state, .no-results {
      text-align: center;
      padding: 2rem;
      margin: 2rem 0;
      background: rgba(0,0,0,0.05);
      border-radius: 8px;
    }
    .loading-state i {
      animation: spin 1s linear infinite;
      font-size: 2rem;
      color: var(--primary-color);
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .error-state i {
      color: #ff4757;
      font-size: 2rem;
    }
    .no-results i {
      color: var(--text-light);
      font-size: 2rem;
    }
    .property-card {
      transition: all 0.3s ease;
    }
    .property-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(style);
});

// الدوال المساعدة
function getAmenityIcon(amenity) {
  const icons = {
    wifi: "wifi-line",
    parking: "parking-line",
    ac: "temp-hot-line",
    kitchen: "restaurant-2-line",
    garden: "leaf-line",
    microwave: "microwave-line",
    mixer: "mixer-line",
    deepfreezer: "snowy-line",
  };
  return icons[amenity] || "checkbox-circle-line";
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
