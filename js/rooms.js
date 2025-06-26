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
  const studentId = 1; // You should replace this with actual user ID from your auth system

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

    // Refresh the feedback list
    await displayFeedback(unitId);
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    alert("Something went wrong. Please try again.");
  }
};

// New function to fetch and display feedback
async function displayFeedback(roomId) {
  try {
    const feedbackResponse = await _get(`/api/Feedback/GetByUnitId/${roomId}`);
    const feedbackList = feedbackResponse?.$values || [];

    const feedbackContainer = document.createElement("div");
    feedbackContainer.className = "feedback-container";
    feedbackContainer.innerHTML = `
      <h3>Reviews (${feedbackList.length})</h3>
      <div class="feedback-list">
        ${
          feedbackList.length > 0
            ? feedbackList
                .map(
                  (feedback) => `
            <div class="feedback-item">
              <div class="feedback-header">
                <span class="feedback-user">${
                  feedback.studentName || "Anonymous"
                }</span>
                <span class="feedback-rating ${feedback.rating.toLowerCase()}">
                  ${getRatingStars(feedback.rating)}
                </span>
              </div>
              <p class="feedback-comment">"${feedback.comment}"</p>
              <div class="feedback-date">${formatDate(feedback.createdAt)}</div>
            </div>
          `
                )
                .join("")
            : '<p class="no-feedback">No reviews yet. Be the first to review!</p>'
        }
      </div>
    `;

    // Add feedback form
    feedbackContainer.innerHTML += `
      <div class="feedback-form">
        <h4>Add Your Review</h4>
        <form onsubmit="submitFeedback(event)">
          <div class="stars">
            ${[1, 2, 3, 4, 5]
              .map(
                (star) => `
              <span class="star ${selectedRating >= star ? "active" : ""}" 
                    data-value="${star}" 
                    onclick="selectedRating = ${star}; updateStarSelection(${star})">
                ★
              </span>
            `
              )
              .join("")}
          </div>
          <textarea id="commentInput" placeholder="Share your experience..." required></textarea>
          <button type="submit" class="btn-submit">Submit Review</button>
        </form>
      </div>
    `;

    // Update or add feedback section
    const modalContent = document.querySelector(".modal-content");
    const existingFeedback = modalContent.querySelector(".feedback-container");
    if (existingFeedback) {
      modalContent.replaceChild(feedbackContainer, existingFeedback);
    } else {
      modalContent.appendChild(feedbackContainer);
    }

    // Re-attach star rating event listeners
    document.querySelectorAll(".stars .star").forEach((star) => {
      star.addEventListener("click", (e) => {
        selectedRating = Number(star.dataset.value);
        updateStarSelection(selectedRating);
      });
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
  }
}

// Helper function to convert rating to stars
function getRatingStars(rating) {
  const starCount =
    {
      VeryBad: 1,
      Bad: 2,
      Good: 3,
      VeryGood: 4,
      Excellent: 5,
    }[rating] || 0;

  return "★".repeat(starCount) + "☆".repeat(5 - starCount);
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return "";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

window.viewRoomDetails = async function (roomId) {
  const roomCard = document.querySelector(`.room-card[data-id='${roomId}']`);
  if (!roomCard) return;

  // Set basic room info
  document.getElementById("modalRoomTitle").innerText = roomCard.dataset.title;
  document.getElementById("modalRoomLocation").innerText =
    roomCard.dataset.address;
  document.getElementById(
    "modalRoomPrice"
  ).innerText = `${roomCard.dataset.price} EGP`;

  // Set room images
  const photos = JSON.parse(roomCard.dataset.photos || "[]");
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

  // Set room features
  document.getElementById("modalRoomFeatures").innerHTML = `
    <div class="feature"><i class="fas fa-wifi"></i> Free Wi-Fi</div>
    <div class="feature"><i class="fas fa-bed"></i> 1 Bed</div>
    <div class="feature"><i class="fas fa-bath"></i> Private Bathroom</div>
  `;

  // Display feedback
  await displayFeedback(roomId);

  // Show modal
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

// Star rating functionality
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
