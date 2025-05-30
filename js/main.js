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
  const menuBtn = document.querySelector("#menu-btn");
  const navLinks = document.querySelector(".nav__links");
  const menuBtnIcon = menuBtn?.querySelector("i.menu-icon");

  if (menuBtn && navLinks && menuBtnIcon) {
    // Toggle menu when clicking the menu button
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navLinks.classList.toggle("open");
      menuBtnIcon.className = navLinks.classList.contains("open")
        ? "ri-close-line menu-icon"
        : "ri-menu-line menu-icon";
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
        navLinks.classList.remove("open");
        menuBtnIcon.className = "ri-menu-line menu-icon";
      }
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuBtnIcon.className = "ri-menu-line menu-icon";
      });
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

  // ---- بيانات العقارات ----
  const properties = [
    {
      id: 1,
      image:
        "https://i.pinimg.com/474x/4a/5d/ec/4a5dec2b4b5449645d1ec94c21c7b13e.jpg",
      price: "€ 2,850",
      title: "Unit no. 411 Admiral Elite Premium Residence",
      location: "Adnan, Minya, Egypt",
      type: "APARTMENTS",
      size: "899 sq feet",
      beds: 2,
      added: "2 days ago",
    },
    {
      id: 2,
      image:
        "https://i.pinimg.com/474x/61/79/2b/61792b67866bf092917ea64fbace6f10.jpg",
      price: "€ 9,000",
      title: "Unit no. 410 Admiral Elite Premium Residence",
      location: "New Minya City, Egypt",
      type: "APARTMENTS",
      size: "1237 sq feet",
      beds: 3,
      added: "1 week ago",
    },
    {
      id: 3,
      image:
        "https://i.pinimg.com/474x/ef/ac/10/efac10e6ffab391d8840a603e4f12d5e.jpg",
      price: "€ 1,300",
      title: "Unit no. 409 Admiral Elite Premium Residence",
      location: "medan balas, Minya, Egypt",
      type: "APARTMENTS",
      size: "473 sq feet",
      beds: 1,
      added: "3 days ago",
    },
    {
      id: 4,
      image:
        "https://i.pinimg.com/474x/30/b2/57/30b25726e795a88c92ebbf1d0941463f.jpg",
      price: "€ 10,000",
      title: "Unit no. 411 Admiral Elite Premium Residence",
      location: "Taha-Heseen, Minya, Egypt",
      type: "APARTMENTS",
      size: "899 sq feet",
      beds: 2,
      added: "Just added",
    },
    {
      id: 5,
      image:
        "https://i.pinimg.com/474x/8d/c3/78/8dc378a1bb88a143b66c250b1ad23a5f.jpg",
      price: "€8,000",
      title: "Unit no. 410 Admiral Elite Premium Residence",
      location: "New Minya City,the first neighburhood, Egypt",
      type: "APARTMENTS",
      size: "120 m²",
      beds: 3,
      added: "1 day ago",
    },
    {
      id: 6,
      image:
        "https://i.pinimg.com/474x/cf/58/65/cf58652fb2d68e7e044adbb615eb4362.jpg",
      price: "€400",
      title: "Unit no. 410 Admiral Elite Premium Residence",
      location: "Minya City, Egypt",
      type: "APARTMENTS",
      size: "900 sq feet",
      beds: 1,
      added: "2 weeks ago",
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
        <div class="property-image" style="background-image: url('${property.image}')"></div>
        <div class="property-price">${property.price}</div>
        <div class="property-details">
          <h3>${property.title}</h3>
          <p class="property-location">
            <i class="ri-map-pin-line"></i> ${property.location}
          </p>
          <div class="property-features">
            <span class="feature-item">
              <i class="ri-hotel-bed-line"></i>
              <span class="feature-value">${property.beds}</span>
            </span>
            <span class="property-size">
              <i class="ri-ruler-line"></i> ${property.size}
            </span>
          </div>
          <div class="property-type">${property.type}</div>
          <div class="property-added">${property.added}</div>
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
});
