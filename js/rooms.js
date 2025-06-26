import { _get, _post } from "./apiClint.js";

let selectedRating = 1;

function getCurrentRoomId() {
  const modal = document.getElementById("roomDetailsModal");
  return Number(modal.dataset.roomId);
}

function updateStarSelection(rating) {
  const stars = document.querySelectorAll(".stars .star");
  stars.forEach((star) => {
    const starValue = Number(star.getAttribute("data-value"));
    star.classList.toggle("active", starValue <= rating);
  });
}

window.submitFeedback = async function (event) {
  event.preventDefault();

  const comment = document.getElementById("commentInput").value.trim();
  const unitId = getCurrentRoomId();
  const studentId = 1; // Placeholder. Replace with actual student ID logic.

  if (!comment) {
    alert("Please write a review.");
    return;
  }

  const ratingMap = {
    1: "VeryBad",
    2: "Bad",
    3: "Good",
    4: "VeryGood",
    5: "Excellent",
  };

  try {
    const body = {
      comment,
      rating: ratingMap[selectedRating] || "VeryBad",
      studentId,
      unitId,
    };

    await _post("/api/Feedback", body);

    alert("Thank you for your feedback!");
    document.getElementById("commentInput").value = "";
    selectedRating = 1;
    updateStarSelection(selectedRating);
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    alert("Something went wrong. Please try again.");
  }
};

window.viewRoomDetails = function (roomId) {
  const roomCard = document.querySelector(`.room-card[data-id='${roomId}']`);
  if (!roomCard) return;

  const title = roomCard.dataset.title;
  const address = roomCard.dataset.address;
  const price = roomCard.dataset.price;
  const status = roomCard.dataset.status;
  const photos = JSON.parse(roomCard.dataset.photos || "[]");

  document.getElementById("modalRoomTitle").innerText = title;
  document.getElementById("modalRoomLocation").innerText = address;
  document.getElementById("modalRoomPrice").innerText = `${price} EGP`;
  document.getElementById("modalRoomDescription").innerText =
    "Modern and secure room. Details will be dynamically filled later.";

  const gallery = document.querySelector(".room-gallery");
  gallery.innerHTML = photos
    .map(
      (photo) => `
      <img class="gallery-img"
        src="https://easyrentapi0.runasp.net/${photo}"
        alt="Room image"
        onerror="this.onerror=null; this.src='images/default-room.jpg';"
      />`
    )
    .join("");

  const features = document.getElementById("modalRoomFeatures");
  features.innerHTML = `
    <div class="feature"><i class="fas fa-wifi"></i> Free Wi-Fi</div>
    <div class="feature"><i class="fas fa-bed"></i> 1 Bed</div>
    <div class="feature"><i class="fas fa-bath"></i> Private Bathroom</div>
  `;

  const modal = document.getElementById("roomDetailsModal");
  modal.dataset.roomId = roomId;
  modal.style.display = "flex";
};

window.openBookingModal = function (roomId) {
  const bookingModal = document.getElementById("bookingModal");
  const titleEl = document.getElementById("bookingRoomTitle");
  const priceEl = document.getElementById("bookingRoomPrice");
  const idInput = document.getElementById("roomId");

  const selectedRoom = document.querySelector(
    `.room-card[data-id='${roomId}']`
  );

  titleEl.innerText = selectedRoom?.dataset.title || "Room";
  priceEl.innerText = `${selectedRoom?.dataset.price || "EGP"}/month`;
  idInput.value = roomId;

  bookingModal.style.display = "flex";
  bookingModal.dataset.roomId = roomId;
};

window.closeModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const roomsContainer = document.getElementById("rooms-container");
    roomsContainer.innerHTML = `<div class="loading">Loading rooms...</div>`;

    const response = await _get("/api/Unit/GetAllUnits");
    const rooms = response?.$values || [];

    if (rooms.length === 0) {
      roomsContainer.innerHTML = `<div class="no-results">No rooms available</div>`;
      return;
    }

    const visibleRooms = rooms.filter((room) => room.status !== "Pending");

    const roomsHTML = visibleRooms
      .map((room) => {
        const imageUrl =
          room?.photoUrls?.$values?.[0] && room.photoUrls.$values[0] !== ""
            ? `https://easyrentapi0.runasp.net/${room.photoUrls.$values[0]}`
            : "images/default-room.jpg";

        const photoUrls = room?.photoUrls?.$values || [];

        return `
          <div class="room-card"
            data-id="${room.id}"
            data-title="${room.title}"
            data-address="${room.address}"
            data-price="${room.priceForMonth}"
            data-status="${room.status}"
            data-photos='${JSON.stringify(photoUrls)}'>

            <img class="room-image" src="${imageUrl}" alt="${room.title}"
              onerror="this.onerror=null; this.src='images/default-room.jpg';"/>

            <div class="room-details">
              <h3 class="room-title">${room.title}</h3>
              <p class="room-location"><i class="fas fa-map-marker-alt"></i> ${
                room.address
              }</p>
              <p class="room-price">${
                room.priceForMonth
              } EGP <span class="price-period">/month</span></p>
              <div class="booking-status ${
                room.status === "Available" ? "available" : "booked"
              }">
                ${room.status}
              </div>
              <div class="room-actions">
                <button class="btn-book" onclick="openBookingModal(${
                  room.id
                })">Book</button>
                <button class="btn-view" onclick="viewRoomDetails(${
                  room.id
                })">View Details</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    roomsContainer.innerHTML = roomsHTML;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    document.getElementById("rooms-container").innerHTML = `
      <div class="error">Error loading rooms. Please try again later.</div>`;
  }
});

document.querySelectorAll(".star").forEach((star) => {
  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.value);
    updateStarSelection(selectedRating);
  });
});

// Booking form logic
const bookingForm = document.getElementById("bookingForm");
bookingForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  console.log(bookingForm);

  const formData = new FormData(bookingForm);
  const moveInDate = formData.get("moveInDate");
  const duration = formData.get("duration");
  const studentId = formData.get("studentId");

  const startDate = new Date(moveInDate);
  const endDate = new Date(startDate);
  console.log(formData);

  switch (duration) {
    case "academic_year":
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    case "two_semesters":
      endDate.setMonth(endDate.getMonth() + 8);
      break;
    case "one_semester":
      endDate.setMonth(endDate.getMonth() + 4);
      break;
  }

  const unitId = Number(document.getElementById("roomId").value);

  const body = {
    studentId: Number(studentId),
    unitId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };

  console.log(body);

  try {
    await _post("/api/Booking/BookUnit", body);
    alert("Booking successful!");
    closeModal("bookingModal");
  } catch (err) {
    console.error("Booking failed:", err);
    alert("Booking failed. Please try again.");
  }
});
