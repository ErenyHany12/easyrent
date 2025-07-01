import { _get, _post, _delete } from "./apiClint.js";

// الحالة العامة
let selectedRating = 3;
let currentRoomId = null;
let allBookings = [];
let allRooms = [];

// تحويل التقييم لنجوم
function getRatingStars(rating) {
  const map = { VeryBad: 1, Bad: 2, Good: 3, VeryGood: 4, Excellent: 5 };
  const count = map[rating] || 0;
  return "★".repeat(count) + "☆".repeat(5 - count);
}

// تنسيق التاريخ
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// تحديد النجوم المختارة
function updateStarSelection(rating) {
  document.querySelectorAll(".stars .star").forEach((star) => {
    star.classList.toggle("active", Number(star.dataset.value) <= rating);
  });
}

function parseId(id) {
  return typeof id === "number" ? id : parseInt(id, 10) || null;
}

// تحقق إذا الغرفة محجوزة حاليًا
function isRoomBooked(room) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return allBookings.some((b) => {
    if (b.unitTitle !== room.title) return false;
    if (b.isUnitAvailable === false) {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return start <= today && today <= end;
    }
    return false;
  });
}

// إرسال تقييم
window.submitFeedback = async function (e) {
  e.preventDefault();
  const comment = document.getElementById("commentInput").value.trim();
  const studentId = Number(localStorage.getItem("studentId"));

  if (!comment) return alert("من فضلك اكتب تعليقك أولاً");
  if (!studentId) return alert("يجب تسجيل الدخول لإرسال تقييم.");

  try {
    await _post("/api/Feedback", {
      comment,
      rating: {
        1: "VeryBad",
        2: "Bad",
        3: "Good",
        4: "VeryGood",
        5: "Excellent",
      }[selectedRating],
      studentId,
      unitId: currentRoomId,
    });

    alert("✅ تم إرسال تقييمك");
    document.getElementById("commentInput").value = "";
    selectedRating = 3;
    updateStarSelection(3);
    await displayFeedback(currentRoomId);
  } catch (err) {
    console.error(err);
    alert("❌ حدث خطأ أثناء إرسال التقييم");
  }
};

// عرض التقييمات
async function displayFeedback(roomId) {
  try {
    const res = await _get(`/api/Feedback/GetByUnitId/${roomId}`);
    const list = res.$values || [];

    const html = `
      <h3>التقييمات (${list.length})</h3>
      <div class="feedback-list">
        ${
          list.length > 0
            ? list
                .map(
                  (f) => `
            <div class="feedback-item">
              <div class="feedback-header">
                <span class="feedback-user">${f.studentName || "مستخدم"}</span>
                <span class="feedback-rating">${getRatingStars(f.rating)}</span>
              </div>
              <p class="feedback-comment">"${f.comment}"</p>
              <div class="feedback-date">${formatDate(f.createdAt)}</div>
            </div>
          `
                )
                .join("")
            : '<p class="no-feedback">لا توجد تقييمات بعد</p>'
        }
      </div>
    `;

    document.getElementById("feedbackContainer").innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

// عرض تفاصيل الغرفة
window.viewRoomDetails = async function (roomId) {
  currentRoomId = roomId;
  const room = allRooms.find((r) => parseId(r.id) === parseId(roomId));
  if (!room) return;

  document.getElementById("modalRoomTitle").textContent = room.title;
  document.getElementById("modalRoomLocation").textContent =
    room.address || "لا يوجد عنوان";
  document.getElementById("modalRoomPrice").textContent = `${
    room.priceForMonth || 0
  } ج.م`;

  const photos = room.photoUrls?.$values || [];
  const gallery = document.querySelector(".room-gallery");
  gallery.innerHTML = photos
    .map(
      (p) =>
        `<img class="gallery-img" src="https://easyrentapi0.runasp.net/${p}" onerror="this.onerror=null;this.src='images/default-room.jpg'">`
    )
    .join("");

  document.getElementById("modalRoomFeatures").innerHTML = `
    <div class="feature"><i class="fas fa-wifi"></i> وايفاي مجاني</div>
    <div class="feature"><i class="fas fa-bed"></i> سرير مفرد</div>
    <div class="feature"><i class="fas fa-bath"></i> حمام خاص</div>
  `;

  await displayFeedback(roomId);
  document.getElementById("roomDetailsModal").style.display = "flex";
};

// فتح نافذة الحجز
window.openBookingModal = function (roomId) {
  const room = allRooms.find((r) => parseId(r.id) === parseId(roomId));
  if (!room) return;

  document.getElementById("bookingRoomTitle").textContent = room.title;
  document.getElementById("bookingRoomPrice").textContent = `${
    room.priceForMonth || 0
  } ج.م/شهر`;
  document.getElementById("roomId").value = roomId;

  const today = new Date(),
    tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = today.toISOString().split("T")[0],
    tomStr = tomorrow.toISOString().split("T")[0];

  document.getElementById("startDate").value = todayStr;
  document.getElementById("startDate").min = todayStr;
  document.getElementById("endDate").value = tomStr;
  document.getElementById("endDate").min = todayStr;

  document.getElementById("bookingModal").style.display = "flex";
};

window.closeModal = (id) => {
  document.getElementById(id).style.display = "none";
};

// تحديث الحجوزات
async function refreshBookings() {
  try {
    const res = await _get("/api/Booking/GetAllBookings");
    allBookings = res.$values || [];

    console.log("📝 All bookings:");
    console.log(allBookings);

    updateRoomStatuses();
  } catch (err) {
    console.error(err);
  }
}

// تحديث حالة الغرف
function updateRoomStatuses() {
  const studentId = Number(localStorage.getItem("studentId"));

  allRooms.forEach((room) => {
    const el = document.querySelector(`.room-card[data-id="${room.id}"]`);
    if (!el) return;

    const booked = isRoomBooked(room);
    const statusEl = el.querySelector(".booking-status");
    const btnArea = el.querySelector(".room-actions");
    btnArea.innerHTML = "";

    statusEl.className = `booking-status ${booked ? "booked" : "available"}`;
    statusEl.textContent = booked ? "محجوز" : "متاح";

    const booking = allBookings.find(
      (b) =>
        b.unitTitle === room.title &&
        b.isUnitAvailable === false &&
        b.studentId === studentId
    );

    if (booking) {
      btnArea.innerHTML = `
        <button class="btn-cancel" onclick="cancelBooking(${booking.id})">إلغاء الحجز</button>
        <button class="btn-view" onclick="viewRoomDetails(${room.id})">تفاصيل</button>
      `;
    } else if (!booked) {
      btnArea.innerHTML = `
        <button class="btn-book" onclick="openBookingModal(${room.id})">احجز الآن</button>
        <button class="btn-view" onclick="viewRoomDetails(${room.id})">تفاصيل</button>
      `;
    } else {
      btnArea.innerHTML = `
        <button class="btn-view" onclick="viewRoomDetails(${room.id})">تفاصيل</button>
      `;
    }
  });
}
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  // إظهار التوست
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 3000); // 3 ثواني
}
// إظهار التوست
window.showToast = showToast;
// تحميل الغرف عند تشغيل الصفحة
document.addEventListener("DOMContentLoaded", async () => {
  const roomsContainer = document.getElementById("rooms-container");
  roomsContainer.innerHTML = `<div class="loading">جاري تحميل الغرف...</div>`;

  try {
    const [rRes, bRes] = await Promise.all([
      _get("/api/Unit/GetAllUnits").catch(() => ({ $values: [] })),
      _get("/api/Booking/GetAllBookings").catch(() => ({ $values: [] })),
    ]);

    allRooms = rRes.$values || [];
    allBookings = bRes.$values || [];

    if (allRooms.length === 0) {
      roomsContainer.innerHTML = `<div class="no-results">لا توجد غرف متاحة حالياً</div>`;
      return;
    }

    roomsContainer.innerHTML = allRooms
      .filter((r) => r.status !== "Pending")
      .map((room) => {
        const booked = isRoomBooked(room);
        const img = room.photoUrls?.$values?.[0]
          ? `https://easyrentapi0.runasp.net/${room.photoUrls.$values[0]}`
          : "images/default-room.jpg";
        return `
          <div class="room-card" data-id="${room.id}">
            <img class="room-image" src="${img}" onerror="this.onerror=null;this.src='images/default-room.jpg'">
            <div class="room-details">
              <h3 class="room-title">${room.title}</h3>
              <p class="room-location"><i class="fas fa-map-marker-alt"></i> ${
                room.address || "لا يوجد عنوان"
              }</p>
              <p class="room-price">${
                room.priceForMonth || 0
              } ج.م <span class="price-period">/شهر</span></p>
              <div class="booking-status ${booked ? "booked" : "available"}">${
          booked ? "محجوز" : "متاح"
        }</div>
              <div class="room-actions"></div>
            </div>
          </div>
        `;
      })
      .join("");

    updateRoomStatuses();
  } catch (err) {
    console.error(err);
    roomsContainer.innerHTML = `<div class="error">حدث خطأ أثناء تحميل الغرف.</div>`;
  }

  // النجوم للتقييم
  document.querySelectorAll(".stars .star").forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.value);
      updateStarSelection(selectedRating);
    });
  });

  // إرسال الحجز
  document
    .getElementById("bookingForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const studentId = Number(localStorage.getItem("studentId"));
      const unitId = Number(document.getElementById("roomId").value);
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;

      if (!studentId) return alert("يرجى تسجيل الدخول أولاً.");
      if (new Date(endDate) <= new Date(startDate))
        return alert("تاريخ النهاية يجب أن يكون بعد البداية.");

      try {
        const payload = {
          studentId,
          unitId,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        };
        const res = await _post("/api/Booking/BookUnit", payload);
        if (
          (typeof res === "string" && res.toLowerCase().includes("success")) ||
          res.bookingId ||
          res.$id
        ) {
          showToast("✅ تم الحجز بنجاح!", "success");
          closeModal("bookingModal");
          await refreshBookings();
        } else {
          throw new Error("Invalid server response");
        }
      } catch (err) {
        console.error(err);
        showToast("❌ فشل الحجز. حاول مرة أخرى.", "error");
      }
    });
});

// إلغاء الحجز
window.cancelBooking = async function (bookingId) {
  const confirmCancel = confirm("هل أنت متأكد أنك تريد إلغاء الحجز؟");
  if (!confirmCancel) return;

  try {
    await _delete(`/api/Booking/DeleteBooking/${bookingId}`);
    showToast("✅ تم إلغاء الحجز.");
    await refreshBookings();
  } catch (err) {
    console.error(err);
    showToast("❌ فشل الحجز. حاول مرة أخرى.", "error");
  }
};
