// 1. استيراد الدوال من ملف apiclient.js
import { _get } from "./apiclient.js";

console.log("Login Page");

// 2. بيانات افتراضية للطوارئ
const FALLBACK_DATA = [
  {
    id: "1",
    name: "غرفة فردية",
    location: "طه حسين، المنيا",
    price: 1200,
    description: "غرفة مريحة بحمام خاص",
    features: ["واي فاي", "تكييف", "حمام خاص"],
    images: ["https://via.placeholder.com/300x200"],
    bedrooms: 1,
    size: 25,
    type: "single",
  },
];

// 3. المتغيرات العامة
let units = [];
let currentRoomId = null;
let currentRoomPrice = null;

// 4. وظائف API
async function fetchUnits() {
  try {
    units = await _get("/api/Colleges");
    console.log(units);
    renderUnits(units);
  } catch (error) {
    console.error("خطأ في جلب البيانات:", error);
    units = FALLBACK_DATA;
    renderUnits(units);
    showErrorMessage(
      "يتم استخدام بيانات تجريبية، البيانات الحقيقية غير متوفرة"
    );
  }
}

// 5. عرض الوحدات
function renderUnits(unitsToRender) {
  const container = document.getElementById("roomsContainer");
  if (!container) return;

  container.innerHTML = unitsToRender
    .map(
      (unit) => `
    <div class="room-card">
      <img src="${unit.images?.[0] || "https://via.placeholder.com/300x200"}" 
           alt="${unit.name}" class="room-image">
      <div class="room-details">
        <h3 class="room-title">${unit.name}</h3>
        <p class="room-location">
          <i class="fas fa-map-marker-alt"></i> ${unit.location}
        </p>
        <p class="room-price">${unit.price} جنيه 
          <span class="price-period">/شهر</span>
        </p>
        <button class="btn-book" onclick="openRoomDetails('${unit.id}')">
          عرض التفاصيل
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

// 6. فتح تفاصيل الغرفة
function openRoomDetails(unitId) {
  const unit = units.find((u) => u.id === unitId);
  if (!unit) return;

  currentRoomId = unitId;

  document.getElementById("modalRoomTitle").textContent = unit.name;
  document.getElementById("modalRoomLocation").textContent = unit.location;
  document.getElementById("modalRoomPrice").textContent = unit.price;

  document.getElementById("roomDetailsModal").style.display = "flex";
}

// 7. إغلاق النافذة المنبثقة (Single declaration)
function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
  document.body.style.overflow = "auto"; // Re-enable scrolling
}

// 8. تصفية النتائج
function filterUnits() {
  const location = document.getElementById("location").value;
  const minPrice = parseInt(document.getElementById("min-price").value) || 0;
  const maxPrice =
    parseInt(document.getElementById("max-price").value) || 10000;
  const roomType = document.getElementById("room-type").value;

  const filtered = units.filter((unit) => {
    return (
      (!location || unit.location.includes(location)) &&
      unit.price >= minPrice &&
      unit.price <= maxPrice &&
      (!roomType || unit.type.includes(roomType))
    );
  });

  renderUnits(filtered);
}

// 9. عرض رسائل الخطأ
function showErrorMessage(message) {
  const container = document.getElementById("roomsContainer");
  if (!container) return;

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <p>${message}</p>
  `;
  container.appendChild(errorDiv);
}

// Function to open booking modal
function openBookingModal(roomId, title, price) {
  currentRoomId = roomId;
  currentRoomPrice = price;

  // Set room details
  document.getElementById("bookingRoomTitle").textContent = title;
  document.getElementById("bookingRoomPrice").textContent = price;
  document.getElementById("roomId").value = roomId;

  // Reset form
  document.getElementById("bookingForm").reset();
  document.getElementById("customDurationGroup").style.display = "none";

  // Show modal
  document.getElementById("bookingModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

// Calculate end date based on duration
function calculateEndDate(startDate, duration, customMonths = 1) {
  const date = new Date(startDate);

  switch (duration) {
    case "academic_year":
      date.setMonth(date.getMonth() + 9);
      break;
    case "two_semesters":
      date.setMonth(date.getMonth() + 8);
      break;
    case "one_semester":
      date.setMonth(date.getMonth() + 4);
      break;
    case "custom":
      date.setMonth(date.getMonth() + parseInt(customMonths));
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }

  return date.toISOString();
}

// Show notification
function showNotification(message, isSuccess = true) {
  const notification = document.getElementById("notification");
  const messageEl = document.getElementById("notification-message");
  const icon = notification.querySelector("i");

  // Set message and style
  messageEl.textContent = message;
  notification.className = isSuccess
    ? "notification success"
    : "notification error";
  icon.className = isSuccess
    ? "fas fa-check-circle"
    : "fas fa-exclamation-circle";

  // Show notification
  notification.style.display = "flex";
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Hide after 5 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.style.display = "none";
    }, 300);
  }, 5000);
}

// 10. تهيئة الصفحة
function initializePage() {
  fetchUnits();

  // إعداد مستمعي الأحداث
  document
    .getElementById("searchform")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      filterUnits();
    });

  // Booking form submission
  document
    .getElementById("bookingForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Processing...';

      try {
        // Validate form
        const moveInDate = document.getElementById("moveInDate").value;
        if (!moveInDate) {
          throw new Error("Please select a move-in date");
        }

        const duration = document.getElementById("duration").value;
        let customMonths = 1;

        if (duration === "custom") {
          customMonths = document.getElementById("customMonths").value;
          if (!customMonths || customMonths < 1) {
            throw new Error("Please enter a valid number of months");
          }
        }

        // Prepare booking data
        const bookingData = {
          studentId: parseInt(document.getElementById("studentId").value),
          unitId: parseInt(currentRoomId),
          startDate: moveInDate,
          endDate: calculateEndDate(moveInDate, duration, customMonths),
        };

        // Get auth token
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Please log in to book a room");
        }

        // Send booking request
        const response = await fetch(
          "https://easyrentapi0.runasp.net/api/Booking/BookUnit",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(bookingData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Booking failed. Please try again."
          );
        }

        // Show success and close modal
        showNotification("Booking successful! We will contact you soon.");
        closeModal("bookingModal");
      } catch (error) {
        console.error("Booking error:", error);
        showNotification(error.message, false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Booking";
      }
    });

  // Toggle custom duration field
  document.getElementById("duration").addEventListener("change", function () {
    const customDurationGroup = document.getElementById("customDurationGroup");
    customDurationGroup.style.display =
      this.value === "custom" ? "block" : "none";
  });

  // Set minimum date to today
  document.getElementById("moveInDate").min = new Date()
    .toISOString()
    .split("T")[0];
}

// 11. جعل الدوال متاحة عالمياً
window.openRoomDetails = openRoomDetails;
window.closeModal = closeModal;
window.filterUnits = filterUnits;
window.initializePage = initializePage;
window.openBookingModal = openBookingModal;

// بدء التطبيق عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", initializePage);

// Close modal when clicking outside
window.addEventListener("click", function (event) {
  if (event.target.className === "modal") {
    closeModal(event.target.id);
  }
});
