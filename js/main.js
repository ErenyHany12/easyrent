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

// استدعاء تهيئة الإضافات
initCookieConsent();
initNavigation();
initFilter();

document.addEventListener("DOMContentLoaded", () => {
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

    // Close menu when clicking on a link
    navRightItems.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navRightItems.classList.remove("open");
        document.body.style.overflow = "auto";
      });
    });

    // Close menu when clicking outside
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
  } else {
    console.warn("ScrollReveal library not loaded - animations disabled");
  }

  // Back to Top Button Functionality
  const backToTopButton = document.createElement('button');
  backToTopButton.className = 'back-to-top';
  backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(backToTopButton);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // بيانات العقارات
  const properties = [
    {
      id: 1,
      title: "student unit no. 411",
      location: "Minya taha_hessen",
      price: 2850,
      type: "Single",
      size: 899,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ["wifi", "ac", "kitchen", "garden"],
      image: "images/تصميم-غرف-نوم-مودرن.webp",
    },
    {
      id: 2,
      title: "Unit no. 410 Luxury Apartment",
      location: "New Minya City",
      price: 9000,
      type: "Double",
      size: 1237,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ["wifi", "microwave", "ac", "kitchen"],
      image: "images/K2S115.webp",
    },
    {
      id: 3,
      title: "Unit no. 409 Premium room",
      location: "palace square",
      price: 15000,
      type: "Triple",
      size: 1500,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ["wifi", "mixer", "microwave", "kitchen"],
      image: "images/SZC08-2.webp",
    },
    {
      id: 4,
      title: "Unit no. 408 Student Residence",
      location: "Adnan st",
      price: 12000,
      type: "Single",
      size: 750,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ["wifi", "kitchen", "microwave"],
      image: "images/86accfe4dbea3ec8f23b8920f181f676.jpg",
    },
    {
      id: 5,
      title: "Unit no. 407 Luxury Room",
      location: "Alhseny st",
      price: 14000,
      type: "Double",
      size: 1100,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ["wifi", "deepfreezer", "mixer", "kitchen"],
      image: "images/واقعيةdd68711618c0.jpg",
    },
  ];

  // حفظ بيانات العقارات في localStorage
  try {
    localStorage.setItem("propertyData", JSON.stringify(properties));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }

  // دالة عرض العقارات
  function displayProperties(propertiesToShow = properties) {
    const propertyGrid = document.getElementById("property-grid");
    if (!propertyGrid) {
      console.warn("Property grid element not found");
      return;
    }

    propertyGrid.innerHTML = "";

    propertiesToShow.forEach((property) => {
      const propertyCard = document.createElement("div");
      propertyCard.className = "property-card";
      propertyCard.innerHTML = `
        <div class="property-image" style="background-image: url('${
          property.image
        }')"></div>
        <div class="property-price">€${property.price.toLocaleString()}</div>
        <div class="property-details">
          <h3>${property.title}</h3>
          <p class="property-location">
            <i class="ri-map-pin-line"></i> ${property.location}
          </p>
          <div class="property-features">
            <span class="feature-item">
              <i class="ri-hotel-bed-line"></i>
              <span class="feature-value">${property.bedrooms} Bed${
        property.bedrooms > 1 ? "s" : ""
      }</span>
            </span>
            <span class="property-size">
              <i class="ri-ruler-line"></i> ${property.size} sq feet
            </span>
          </div>
          <div class="property-type">${property.type}</div>
          <div class="property-amenities">
            ${property.amenities
              .map(
                (amenity) => `
              <span class="amenity-tag">
                <i class="ri-${getAmenityIcon(amenity)}"></i>
                ${capitalizeFirstLetter(amenity)}
              </span>
            `
              )
              .join("")}
          </div>
        </div>
      `;
      propertyGrid.appendChild(propertyCard);
    });
  }

  // تحميل وعرض بيانات العقارات من localStorage
  try {
    const savedData = localStorage.getItem("propertyData");
    if (savedData) {
      displayProperties(JSON.parse(savedData));
    } else {
      displayProperties();
    }
  } catch (e) {
    console.warn("Could not load from localStorage:", e);
    displayProperties();
  }

  // ---- Feature Cards: clickable with hover effect ----
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
    // Set initial state to light mode
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

  // ---- Toggle filter sections ----
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

  // فتح جميع الأقسام بشكل افتراضي
  document.querySelectorAll(".filter-content").forEach((content) => {
    content.style.maxHeight = content.scrollHeight + "px";
  });

  // ---- Filter Controls ----
  const forRentSelect = document.getElementById("forRent");
  const currencySelect = document.getElementById("currency");
  const areaUnitSelect = document.getElementById("areaUnit");
  const bathroomSelect = document.getElementById("bathroomCount");
  const bedroomSelect = document.getElementById("bedroomCount");
  const kitchenSelect = document.getElementById("kitchenCount");
  const resetBtn = document.getElementById("resetFilter");
  const applyBtn = document.getElementById("applyFilter");

  // إعادة تعيين الفلاتر
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

  // تطبيق الفلاتر
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
      // هنا تضيف منطق تصفية البيانات حسب الفلاتر
    });
  }

  // ---- Toggle filter section on header click ----
  document.querySelectorAll(".filter-header").forEach((header) => {
    header.addEventListener("click", () => toggleSection(header));
  });

  // Execute search functionality
  const executeSearchBtn = document.getElementById("execute-search");
  if (executeSearchBtn) {
    executeSearchBtn.addEventListener("click", () => {
      const location = document.getElementById("location").value;
      const price = document.getElementById("price").value;
      const type = document.getElementById("type").value;

      // Create filter object
      const filters = {
        location,
        price,
        type,
      };

      // Log the filters (for testing)
      console.log("Applied filters:", filters);

      // Here you can add the actual filtering logic
      // For example, filtering the property cards based on the selected values
      filterProperties(filters);
    });
  }

  // Function to filter properties
  function filterProperties(filters) {
    const propertyCards = document.querySelectorAll(".property-card");

    propertyCards.forEach((card) => {
      let shouldShow = true;

      // Location filter
      if (filters.location !== "all") {
        const cardLocation =
          card.querySelector(".property-location").textContent;
        if (
          !cardLocation.toLowerCase().includes(filters.location.toLowerCase())
        ) {
          shouldShow = false;
        }
      }

      // Price filter
      if (filters.price !== "all") {
        const cardPrice = card.querySelector(".property-price").textContent;
        const price = parseFloat(cardPrice.replace(/[^0-9.-]+/g, ""));

        const [min, max] = filters.price.split("-").map((p) => parseFloat(p));
        if (filters.price.includes("+")) {
          if (price < min) shouldShow = false;
        } else if (price < min || price > max) {
          shouldShow = false;
        }
      }

      // Type filter
      if (filters.type !== "all") {
        const cardType = card.querySelector(".property-type").textContent;
        if (!cardType.toLowerCase().includes(filters.type.toLowerCase())) {
          shouldShow = false;
        }
      }

      // Show/hide the card
      card.style.display = shouldShow ? "block" : "none";
    });
  }

  // More Details Dropdown functionality
  const moreDetailsBtn = document.getElementById("more-details-btn");
  const moreContent = document.getElementById("more-content");
  const resetFiltersBtn = document.getElementById("reset-filters");
  const applyFiltersBtn = document.getElementById("apply-filters");

  if (moreDetailsBtn && moreContent) {
    let isAnimating = false;

    moreDetailsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isAnimating) return;

      isAnimating = true;
      moreDetailsBtn.classList.toggle("active");
      moreContent.classList.toggle("show");

      // Reset animation flag after transition
      setTimeout(() => {
        isAnimating = false;
      }, 300);
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !moreDetailsBtn.contains(e.target) &&
        !moreContent.contains(e.target)
      ) {
        moreDetailsBtn.classList.remove("active");
        moreContent.classList.remove("show");
      }
    });

    // Prevent closing when clicking inside dropdown
    moreContent.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Handle escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && moreContent.classList.contains("show")) {
        moreDetailsBtn.classList.remove("active");
        moreContent.classList.remove("show");
      }
    });
  }

  // Reset filters functionality
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      const selects = moreContent.querySelectorAll("select");
      selects.forEach((select) => {
        select.value = select.firstElementChild.value;
      });

      // Add visual feedback
      resetFiltersBtn.classList.add("clicked");
      setTimeout(() => {
        resetFiltersBtn.classList.remove("clicked");
      }, 200);
    });
  }

  // Apply filters functionality
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", () => {
      const filters = {
        minSize: document.getElementById("minSize").value,
        maxSize: document.getElementById("maxSize").value,
        currency: document.getElementById("currency").value,
        areaUnit: document.getElementById("areaUnit").value,
        bathroom: document.getElementById("bathroomCount").value,
        bedroom: document.getElementById("bedroomCount").value,
        kitchen: document.getElementById("kitchenCount").value,
      };

      console.log("Applied filters:", filters);

      // Add visual feedback
      applyFiltersBtn.classList.add("clicked");
      setTimeout(() => {
        applyFiltersBtn.classList.remove("clicked");
      }, 200);

      // Close the dropdown after applying filters
      setTimeout(() => {
        moreDetailsBtn.classList.remove("active");
        moreContent.classList.remove("show");
      }, 300);
    });
  }

  // Improve room card interaction
  const roomCards = document.querySelectorAll(".room__card");
  roomCards.forEach((card) => {
    card.addEventListener("click", () => {
      // Get room details
      const title = card.querySelector("h4").textContent;
      const price = card.querySelector(".room__price h3").textContent;
      const features = card.querySelector(".room__features").textContent;

      console.log("Selected room:", { title, price, features });
      // Here you can add logic to show room details modal or navigate to room page
    });
  });

  // تهيئة الأحداث عند تحميل الصفحة
  document.addEventListener("DOMContentLoaded", function () {
    // تهيئة قائمة More Details
    initMoreDetails();

    // تهيئة أزرار الفلتر
    initFilterButtons();

    // تهيئة عدادات الغرف
    initRoomCounters();

    // تهيئة نطاق السعر
    initPriceRange();
  });

  // تهيئة قائمة More Details
  function initMoreDetails() {
    const moreDetailsBtn = document.getElementById("more-details-btn");
    const moreContent = document.getElementById("more-content");

    if (moreDetailsBtn && moreContent) {
      moreDetailsBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        moreContent.classList.toggle("show");
        this.classList.toggle("active");
      });

      // إغلاق القائمة عند النقر خارجها
      document.addEventListener("click", function (e) {
        if (
          !moreContent.contains(e.target) &&
          !moreDetailsBtn.contains(e.target)
        ) {
          moreContent.classList.remove("show");
          moreDetailsBtn.classList.remove("active");
        }
      });

      // إغلاق القائمة عند الضغط على ESC
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          moreContent.classList.remove("show");
          moreDetailsBtn.classList.remove("active");
        }
      });
    }
  }

  // تهيئة أزرار الفلتر
  function initFilterButtons() {
    const applyBtn = document.getElementById("apply-filters");
    const resetBtn = document.getElementById("reset-filters");
    const searchBtn = document.getElementById("execute-search");

    if (applyBtn) {
      applyBtn.addEventListener("click", function () {
        applyFilters();
        closeMoreDetails();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        resetFilters();
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        applyFilters();
      });
    }
  }

  // تطبيق الفلاتر
  function applyFilters() {
    const filters = collectFilterValues();
    updatePropertyDisplay(filters);

    // إغلاق قائمة More Details بعد تطبيق الفلاتر
    const moreContent = document.getElementById("more-content");
    if (moreContent) {
      moreContent.classList.remove("show");
    }
  }

  // جمع قيم الفلاتر
  function collectFilterValues() {
    return {
      location: document.getElementById("location")?.value || "all",
      price: document.getElementById("priceRange")?.value || 10000,
      type: document.getElementById("type")?.value || "all",
      minSize: document.getElementById("minSize")?.value || "",
      maxSize: document.getElementById("maxSize")?.value || "",
      bedrooms: document.getElementById("bedroomsCount")?.textContent || "1",
      bathrooms: document.getElementById("bathroomsCount")?.textContent || "1",
      amenities: Array.from(
        document.querySelectorAll(".amenity-checkbox input:checked")
      ).map((cb) => cb.value),
    };
  }

  // إعادة تعيين الفلاتر
  function resetFilters() {
    const inputs = {
      location: "all",
      priceRange: 10000,
      type: "all",
      minSize: "",
      maxSize: "",
      bedroomsCount: "1",
      bathroomsCount: "1",
    };

    Object.entries(inputs).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        if (element.tagName === "SELECT") {
          element.value = value;
        } else {
          element.textContent = value;
        }
      }
    });

    // إعادة تعيين مربعات الاختيار
    document
      .querySelectorAll(".amenity-checkbox input")
      .forEach((cb) => (cb.checked = false));

    // تحديث نطاق السعر
    updatePriceRangeDisplay();

    // تطبيق الفلاتر بعد إعادة التعيين
    applyFilters();
  }

  // تهيئة عدادات الغرف
  function initRoomCounters() {
    // العثور على جميع أزرار العداد
    const counterButtons = document.querySelectorAll(".counter-btn");

    counterButtons.forEach((button) => {
      button.addEventListener("click", handleCounterClick);
    });
  }

  // معالجة النقر على أزرار العداد
  function handleCounterClick(event) {
    const button = event.currentTarget;
    const type = button.dataset.type; // bedrooms or bathrooms
    const action = button.dataset.action; // increase or decrease
    const counterElement = document.getElementById(`${type}Count`);

    if (!counterElement) return;

    let currentValue = parseInt(counterElement.textContent);

    if (action === "increase") {
      // زيادة القيمة حتى 10 كحد أقصى
      if (currentValue < 10) {
        currentValue++;
        animateValue(counterElement, "increase");
      } else {
        shakeButton(button); // تأثير الاهتزاز إذا وصلنا للحد الأقصى
      }
    } else if (action === "decrease") {
      // تقليل القيمة حتى 1 كحد أدنى
      if (currentValue > 1) {
        currentValue--;
        animateValue(counterElement, "decrease");
      } else {
        shakeButton(button); // تأثير الاهتزاز إذا وصلنا للحد الأدنى
      }
    }

    counterElement.textContent = currentValue;

    // تحديث تأثير الأزرار
    updateButtonStates(type, currentValue);

    // تطبيق الفلاتر تلقائياً
    applyFilters();
  }

  // تحديث حالة الأزرار (تعطيل/تفعيل)
  function updateButtonStates(type, value) {
    const decreaseBtn = document.querySelector(
      `[data-type="${type}"][data-action="decrease"]`
    );
    const increaseBtn = document.querySelector(
      `[data-type="${type}"][data-action="increase"]`
    );

    if (decreaseBtn) {
      decreaseBtn.disabled = value <= 1;
      decreaseBtn.classList.toggle("disabled", value <= 1);
    }

    if (increaseBtn) {
      increaseBtn.disabled = value >= 10;
      increaseBtn.classList.toggle("disabled", value >= 10);
    }
  }

  // تأثير حركي عند تغيير القيمة
  function animateValue(element, direction) {
    element.classList.add("counter-animation", direction);
    setTimeout(() => {
      element.classList.remove("counter-animation", direction);
    }, 300);
  }

  // تأثير الاهتزاز للأزرار
  function shakeButton(button) {
    button.classList.add("shake");
    setTimeout(() => {
      button.classList.remove("shake");
    }, 500);
  }

  // إضافة الأنماط للتأثيرات الحركية
  const style = document.createElement("style");
  style.textContent = `
    .counter-value {
        display: inline-block;
        min-width: 30px;
        text-align: center;
        transition: all 0.3s ease;
    }

    .counter-animation {
        animation: pulse 0.3s ease-out;
    }

    .counter-animation.increase {
        animation: slideUp 0.3s ease-out;
    }

    .counter-animation.decrease {
        animation: slideDown 0.3s ease-out;
    }

    .shake {
        animation: shake 0.5s ease-in-out;
    }

    .counter-btn.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }

    @keyframes slideUp {
        0% { transform: translateY(10px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
    }

    @keyframes slideDown {
        0% { transform: translateY(-10px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);

  // تهيئة نطاق السعر
  function initPriceRange() {
    const range = document.getElementById("priceRange");
    if (range) {
      range.addEventListener("input", updatePriceRangeDisplay);
      updatePriceRangeDisplay(); // تحديث العرض الأولي
    }
  }

  function updatePriceRangeDisplay() {
    const range = document.getElementById("priceRange");
    const value = document.getElementById("priceValue");
    if (range && value) {
      const priceValue = parseInt(range.value);
      value.textContent = `€${priceValue.toLocaleString()}`;

      // تحديث شريط التقدم
      const progress =
        ((priceValue - range.min) / (range.max - range.min)) * 100;
      range.style.background = `linear-gradient(to right, var(--primary-color) ${progress}%, #e0e0e0 ${progress}%)`;
    }
  }

  // تعريف الدوال بشكل عام
  window.updateFilters = function (type, value) {
    // تحديث قيمة العداد في الواجهة
    const countElement = document.getElementById(`${type}Count`);
    if (countElement) {
      countElement.textContent = value;
    }

    // جمع جميع قيم الفلاتر الحالية
    const filters = {
      location: document.getElementById("location")?.value || "all",
      price: parseInt(document.getElementById("priceRange")?.value || 10000),
      type: document.getElementById("type")?.value || "all",
      bedrooms: parseInt(
        document.getElementById("bedroomsCount")?.textContent || "1"
      ),
      bathrooms: parseInt(
        document.getElementById("bathroomsCount")?.textContent || "1"
      ),
      amenities: Array.from(
        document.querySelectorAll(".amenity-checkbox input:checked")
      ).map((cb) => cb.value),
    };

    // تحديث عرض العقارات
    updatePropertyDisplay(filters);
  };

  // تحديث عرض العقارات
  function updatePropertyDisplay(filters) {
    const propertyGrid = document.getElementById("property-grid");
    if (!propertyGrid) return;

    const properties = Array.from(propertyGrid.children);
    let hasVisibleProperties = false;

    properties.forEach((property) => {
      if (property.classList.contains("no-results")) return;

      const matches = checkPropertyMatches(property, filters);
      if (matches) {
        property.style.display = "block";
        fadeIn(property);
        hasVisibleProperties = true;
      } else {
        fadeOut(property);
      }
    });

    // عرض رسالة إذا لم يتم العثور على نتائج
    const noResultsElement = document.querySelector(".no-results");
    if (!hasVisibleProperties) {
      if (!noResultsElement) {
        const noResults = document.createElement("div");
        noResults.className = "no-results";
        noResults.innerHTML = `
          <i class="ri-search-line"></i>
          <h3>لم يتم العثور على نتائج</h3>
          <p>حاول تغيير معايير البحث</p>
        `;
        propertyGrid.appendChild(noResults);
      }
    } else if (noResultsElement) {
      noResultsElement.remove();
    }
  }

  // تحديث دوال الزيادة والنقصان
  window.increment = function (type) {
    const countElement = document.getElementById(`${type}Count`);
    if (countElement) {
      let value = parseInt(countElement.textContent);
      if (value < 10) {
        value++;
        countElement.textContent = value;
        animateCounter(countElement, "up");
        updateCounterButtons(type, value);
        window.updateFilters(type, value); // استخدام النسخة العامة من الدالة
      } else {
        shakeElement(countElement);
      }
    }
  };

  window.decrement = function (type) {
    const countElement = document.getElementById(`${type}Count`);
    if (countElement) {
      let value = parseInt(countElement.textContent);
      if (value > 1) {
        value--;
        countElement.textContent = value;
        animateCounter(countElement, "down");
        updateCounterButtons(type, value);
        window.updateFilters(type, value); // استخدام النسخة العامة من الدالة
      } else {
        shakeElement(countElement);
      }
    }
  };

  // إضافة باقي الدوال المساعدة للنافذة العامة
  window.checkPropertyMatches = function (property, filters) {
    const bedroomsMatch = checkRoomCount(
      property,
      "bedrooms",
      filters.bedrooms
    );
    const bathroomsMatch = checkRoomCount(
      property,
      "bathrooms",
      filters.bathrooms
    );
    const priceMatch = checkPrice(property, filters.price);
    const locationMatch = checkLocation(property, filters.location);
    const typeMatch = checkType(property, filters.type);
    const amenitiesMatch = checkAmenities(property, filters.amenities);

    return (
      bedroomsMatch &&
      bathroomsMatch &&
      priceMatch &&
      locationMatch &&
      typeMatch &&
      amenitiesMatch
    );
  };

  function checkRoomCount(property, type, filterValue) {
    const roomElement = property.querySelector(`.property-${type}`);
    if (!roomElement) return true;

    const roomCount = parseInt(
      roomElement.textContent.match(/\d+/)?.[0] || "0"
    );
    return roomCount >= filterValue;
  }

  function checkPrice(property, maxPrice) {
    const priceElement = property.querySelector(".property-price");
    if (!priceElement) return true;

    const price = parseInt(
      priceElement.textContent.replace(/[^0-9]/g, "") || "0"
    );
    return price <= maxPrice;
  }

  function checkLocation(property, filterLocation) {
    if (filterLocation === "all") return true;

    const locationElement = property.querySelector(".property-location");
    return (
      locationElement &&
      locationElement.textContent
        .toLowerCase()
        .includes(filterLocation.toLowerCase())
    );
  }

  function checkType(property, filterType) {
    if (filterType === "all") return true;

    const typeElement = property.querySelector(".property-type");
    return (
      typeElement &&
      typeElement.textContent.toLowerCase().includes(filterType.toLowerCase())
    );
  }

  function checkAmenities(property, filterAmenities) {
    if (!filterAmenities || filterAmenities.length === 0) return true;

    const propertyAmenities = Array.from(
      property.querySelectorAll(".property-amenity")
    ).map((amenity) => amenity.dataset.amenity);

    return filterAmenities.every((amenity) =>
      propertyAmenities.includes(amenity)
    );
  }

  function fadeIn(element) {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    element.style.display = "block";

    requestAnimationFrame(() => {
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
      element.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    });
  }

  function fadeOut(element) {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    element.style.transition = "opacity 0.3s ease, transform 0.3s ease";

    setTimeout(() => {
      element.style.display = "none";
    }, 300);
  }

  // إضافة مستمع لزر تطبيق الفلاتر
  document.addEventListener("DOMContentLoaded", function () {
    const applyButton = document.getElementById("apply-filters");
    if (applyButton) {
      applyButton.addEventListener("click", function () {
        window.updateFilters();
      });
    }

    // مستمع لتغييرات نطاق السعر
    const priceRange = document.getElementById("priceRange");
    if (priceRange) {
      priceRange.addEventListener("input", function () {
        const priceValue = document.getElementById("priceValue");
        if (priceValue) {
          priceValue.textContent = `€${parseInt(this.value).toLocaleString()}`;
        }
        window.updateFilters("price", this.value);
      });
    }

    // مستمعات أخرى للفلاتر
    const filters = ["location", "type"];
    filters.forEach((filter) => {
      const element = document.getElementById(filter);
      if (element) {
        element.addEventListener("change", function () {
          window.updateFilters(filter, this.value);
        });
      }
    });

    // مستمع لتغييرات المرافق
    const amenityCheckboxes = document.querySelectorAll(
      ".amenity-checkbox input"
    );
    amenityCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        window.updateFilters(
          "amenities",
          Array.from(
            document.querySelectorAll(".amenity-checkbox input:checked")
          ).map((cb) => cb.value)
        );
      });
    });
  });

  // الحصول على أيقونة المرفق
  function getAmenityIcon(amenity) {
    const icons = {
      wifi: "wifi-line",
      parking: "parking-line",
      ac: "temp-hot-line",
      kitchen: "restaurant-2-line",
    };
    return icons[amenity] || "checkbox-circle-line";
  }

  // تحويل أول حرف إلى كبير
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // إضافة أنماط CSS للعناصر الجديدة
  const propertyStyles = document.createElement("style");
  propertyStyles.textContent = `
    .property-info {
        display: flex;
        gap: 15px;
        margin: 10px 0;
    }

    .property-info span {
        display: flex;
        align-items: center;
        gap: 5px;
        color: var(--text-color);
        font-size: 14px;
    }

    .property-amenities {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
    }

    .amenity-tag {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 4px 8px;
        background: var(--light-bg);
        border-radius: 4px;
        font-size: 12px;
        color: var(--text-color);
    }

    .amenity-tag i {
        color: var(--primary-color);
        font-size: 14px;
    }

    /* تحسين شريط نطاق السعر */
    #priceRange {
        -webkit-appearance: none;
        width: 100%;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        outline: none;
    }

    #priceRange::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    }

    #priceRange::-webkit-slider-thumb:hover {
        transform: scale(1.1);
    }

    #priceValue {
        font-weight: 600;
        color: var(--primary-color);
    }

    .no-results {
        text-align: center;
        padding: 40px;
        background: var(--white);
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .no-results i {
        font-size: 48px;
        color: var(--primary-color);
        margin-bottom: 15px;
    }

    .no-results h3 {
        font-size: 20px;
        color: var(--text-dark);
        margin-bottom: 10px;
    }

    .no-results p {
        color: var(--text-light);
    }
  `;
  document.head.appendChild(propertyStyles);
});
