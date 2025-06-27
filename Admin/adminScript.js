import { _get, _post, _put, _delete } from "../js/apiClint.js";
let units = [];
let currentUnitId = null;
let bookings = [];
let students = [];
let currentStudentId = null;

// ====================== Fetch & Render ======================

async function fetchUnits() {
  try {
    showLoading("unitsTable", "Loading units...");
    const data = await _get("/api/Unit/GetAllUnits");
    units = data?.$values || [];

    if (units.length === 0) {
      showNoData("unitsTable", "No units found");
    } else {
      renderUnitsTable();
    }

    updateUnitStats();
    showNotification("Units loaded successfully", true);
  } catch (error) {
    console.error("Fetch units error:", error);
    showNoData("unitsTable", "Error loading units. Please try again.");
    showNotification(`Failed to load units: ${error.message}`, false);
  }
}

async function fetchBookings() {
  try {
    showLoading("recentBookingsTable", "Loading bookings...");
    const data = await _get("/api/Booking/GetAllBookings");
    bookings = data?.$values || [];
    if (bookings.length === 0) {
      showNoData("recentBookingsTable", "No bookings found");
    } else {
      renderBookingsTable();
    }
    showNotification("Bookings loaded successfully", true);
  } catch (error) {
    console.error("Fetch bookings error:", error);
    showNoData("recentBookingsTable", "Error loading bookings.");
    showNotification(`Failed to load bookings: ${error.message}`, false);
  }
}

function renderUnitsTable(filter = "") {
  const container = document.getElementById("unitsTable");
  const filteredUnits = units.filter(
    (unit) =>
      unit.title?.toLowerCase().includes(filter.toLowerCase()) ||
      unit.address?.toLowerCase().includes(filter.toLowerCase()) ||
      unit.ownerName?.toLowerCase().includes(filter.toLowerCase())
  );

  if (filteredUnits.length === 0 && filter) {
    container.innerHTML = `<div class="no-data"><i class="material-icons">info</i> No matching units found</div>`;
    return;
  }

  container.innerHTML = filteredUnits
    .map((unit) => {
      const actionButtons =
        unit.status === "Pending"
          ? `
        <button class="btn btn-success btn-sm approve-btn" data-unit-id="${unit.id}" data-tooltip="Approve Unit">
          <i class="fas fa-check"></i> Approve
        </button>
        <button class="btn btn-danger btn-sm reject-btn" data-unit-id="${unit.id}" data-tooltip="Reject Unit">
          <i class="fas fa-times"></i> Reject
        </button>`
          : "";

      return `
        <div class="unit-card">
          <div class="card-header">
            <h3 class="card-title">${unit.title || "Untitled"}</h3>
            <span class="card-status status-${unit.status.toLowerCase()}">${
        unit.status
      }</span>
          </div>
          <div class="card-details">
            <span><i class="fas fa-id-badge"></i> ID: ${unit.id}</span>
            <span><i class="fas fa-money-bill-wave"></i> ${unit.priceForMonth.toFixed(
              2
            )} EGP/month</span>
            <span><i class="fas fa-map-marker-alt"></i> ${
              unit.address || "N/A"
            }</span>
            <span><i class="fas fa-user"></i> ${unit.ownerName || "N/A"}</span>
            <div class="unit-photos-container">${renderUnitPhotos(
              unit.photoUrls
            )}</div>
          </div>
          <div class="card-actions">
            ${actionButtons}
            <button class="btn btn-primary btn-sm view-btn" data-unit-id="${
              unit.id
            }" data-tooltip="View Details">
              <i class="fas fa-eye"></i> View
            </button>
            <button class="btn btn-danger btn-sm delete-btn" data-unit-id="${
              unit.id
            }" data-tooltip="Delete Unit">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>`;
    })
    .join("");
}

function renderBookingsTable() {
  const container = document.getElementById("recentBookingsTable");
  if (bookings.length === 0) {
    container.innerHTML = `<div class="no-data"><i class="material-icons">info</i> No bookings found</div>`;
    return;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const now = new Date();

  container.innerHTML = bookings
    .map((booking) => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      const bookingDate = new Date(booking.bookingDate);
      const status = endDate > now ? "Active" : "Expired";
      const price =
        booking.unitPriceForMonth > 0
          ? `${booking.unitPriceForMonth.toFixed(2)} EGP/month`
          : "Free";

      return `
        <div class="booking-card">
          <div class="card-header">
            <h3 class="card-title">Booking #${booking.bookingId}</h3>
            <span class="card-status status-${status.toLowerCase()}">${status}</span>
          </div>
          <div class="card-details">
            <span><i class="fas fa-user"></i> ${
              booking.studentName || "N/A"
            }</span>
            <span><i class="fas fa-home"></i> ${
              booking.unitTitle || "N/A"
            }</span>
            <span><i class="fas fa-map-marker-alt"></i> ${
              booking.unitLocation || "N/A"
            }</span>
            <span><i class="fas fa-money-bill-wave"></i> ${price}</span>
            <span><i class="fas fa-calendar"></i> ${formatter.format(
              startDate
            )} to ${formatter.format(endDate)}</span>
            <span><i class="fas fa-check-circle"></i> Available: ${
              booking.isUnitAvailable ? "Yes" : "No"
            }</span>
            <span class="booking-date"><i class="fas fa-clock"></i> Booked on ${formatter.format(
              bookingDate
            )}</span>
          </div>
        </div>`;
    })
    .join("");
}

function renderUnitPhotos(photoUrls) {
  const photos = photoUrls?.$values || [];
  if (photos.length === 0) return "<span>No photos</span>";

  const thumbnails = photos.slice(0, 3).map(
    (photo) => `
      <img src="https://easyrentapi0.runasp.net/${photo}"
        class="unit-photo-thumbnail"
        title="Click to view larger"
        onclick="viewPhotoInLightbox('${photo}')"/>`
  );

  const more =
    photos.length > 3 ? `<span>+${photos.length - 3} more</span>` : "";
  return thumbnails.join("") + more;
}

function updateUnitStats() {
  const totalUnits = units.length;
  const pendingUnits = units.filter((u) => u.status === "Pending").length;
  const availableUnits = units.filter((u) => u.status === "Approved").length;

  document.querySelectorAll("#totalUnitsCount").forEach((el) => {
    el.textContent = totalUnits;
    el.parentElement.querySelector(
      ".stat-change"
    ).innerHTML = `<i class="fas fa-check"></i> Updated`;
  });
  document.querySelectorAll("#pendingUnitsCount").forEach((el) => {
    el.textContent = pendingUnits;
    el.parentElement.querySelector(
      ".stat-change"
    ).innerHTML = `<i class="fas fa-check"></i> Updated`;
  });
  document.querySelectorAll("#availableUnitsCount").forEach((el) => {
    el.textContent = availableUnits;
    el.parentElement.querySelector(
      ".stat-change"
    ).innerHTML = `<i class="fas fa-check"></i> Updated`;
  });
}

// ====================== Unit Actions ======================

async function approveUnit(unitId) {
  if (!confirm("Are you sure you want to approve this unit?")) return;

  try {
    showLoading("unitsTable", "Approving unit...");
    const response = await fetch(
      `https://easyrentapi0.runasp.net/api/Unit/ApproveUnit/${unitId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (!response.ok)
      throw new Error(`Approval failed: ${response.statusText}`);

    const unit = units.find((u) => u.id === unitId);
    if (unit) unit.status = "Approved";

    renderUnitsTable(document.querySelector(".search-input")?.value || "");
    updateUnitStats();
    showNotification("Unit approved successfully", true);
  } catch (error) {
    console.error("Approve error:", error);
    showNotification(`Failed to approve unit: ${error.message}`, false);
  }
}

function openRejectModal(unitId) {
  currentUnitId = unitId;
  const modal = document.getElementById("rejectModal");
  modal.classList.add("show");
}

async function confirmRejection() {
  const reason = document.getElementById("rejectionReason").value.trim();
  if (!reason) {
    showNotification("Please provide a rejection reason", false);
    return;
  }

  try {
    showLoading("unitsTable", "Rejecting unit...");
    const response = await fetch(
      `https://easyrentapi0.runasp.net/api/Unit/RejectUnit/${currentUnitId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ rejectionReason: reason }),
      }
    );

    if (!response.ok)
      throw new Error(`Rejection failed: ${response.statusText}`);

    const unit = units.find((u) => u.id === currentUnitId);
    if (unit) unit.status = "Rejected";

    renderUnitsTable(document.querySelector(".search-input")?.value || "");
    updateUnitStats();
    showNotification("Unit rejected successfully", true);
    closeModal();
  } catch (error) {
    console.error("Reject error:", error);
    showNotification(`Failed to reject unit: ${error.message}`, false);
  }
}

async function deleteUnit(unitId) {
  if (
    !confirm(
      "Are you sure you want to delete this unit? This action cannot be undone."
    )
  )
    return;

  try {
    showLoading("unitsTable", "Deleting unit...");
    const response = await fetch(
      `https://easyrentapi0.runasp.net/api/Unit/${unitId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (!response.ok) throw new Error(`Delete failed: ${response.statusText}`);

    units = units.filter((u) => u.id !== unitId);
    renderUnitsTable(document.querySelector(".search-input")?.value || "");
    updateUnitStats();
    showNotification("Unit deleted successfully", true);
  } catch (error) {
    console.error("Delete error:", error);
    showNotification(`Failed to delete unit: ${error.message}`, false);
  }
}

// ====================== View Unit ======================

function viewUnitDetails(unitId) {
  const unit = units.find((u) => u.id === unitId);
  if (!unit) {
    showNotification("Unit not found", false);
    return;
  }

  document.getElementById("unitModalTitle").textContent =
    unit.title || "Untitled Unit";
  document.getElementById("unitModalId").textContent = unit.id;
  document.getElementById(
    "unitModalPrice"
  ).textContent = `${unit.priceForMonth.toFixed(2)} EGP/month`;
  document.getElementById("unitModalAddress").textContent =
    unit.address || "N/A";
  document.getElementById(
    "unitModalStatus"
  ).innerHTML = `<span class="status status-${unit.status.toLowerCase()}">${
    unit.status
  }</span>`;
  document.getElementById("unitModalOwner").textContent = `${
    unit.ownerName || "N/A"
  } (ID: ${unit.ownerId_FK || "N/A"})`;

  const photosContainer = document.getElementById("unitModalPhotos");
  photosContainer.innerHTML = "";

  const photos = unit.photoUrls?.$values || [];
  if (photos.length === 0) {
    photosContainer.innerHTML = `<div class="no-data"><i class="material-icons">photo_camera</i> No photos available</div>`;
  } else {
    photos.forEach((photo) => {
      const wrapper = document.createElement("div");
      wrapper.className = "photo-wrapper";
      wrapper.innerHTML = `<img src="https://easyrentapi0.runasp.net/${photo}" onclick="viewPhotoInLightbox('${photo}')">`;
      photosContainer.appendChild(wrapper);
    });
  }

  const modal = document.getElementById("unitDetailsModal");
  modal.classList.add("show");
}

// ====================== Lightbox ======================

function viewPhotoInLightbox(photoUrl) {
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `<img src="https://easyrentapi0.runasp.net/${photoUrl}">`;
  lightbox.onclick = () => {
    lightbox.classList.remove("show");
    setTimeout(() => lightbox.remove(), 300);
  };
  document.body.appendChild(lightbox);
  setTimeout(() => lightbox.classList.add("show"), 10);
}

// ====================== Modals & UI ======================

function closeModal() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.remove("show");
  });
  currentUnitId = null;
  const rejectionInput = document.getElementById("rejectionReason");
  if (rejectionInput) rejectionInput.value = "";
}

function showLoading(id, message) {
  const el = document.getElementById(id);
  el.innerHTML = `<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> ${message}</div>`;
}

function showNoData(id, message) {
  const el = document.getElementById(id);
  el.innerHTML = `<div class="no-data"><i class="material-icons">info</i> ${message}</div>`;
}

function showNotification(msg, isSuccess = true) {
  const n = document.createElement("div");
  n.className = `notification ${isSuccess ? "success" : "error"}`;
  n.innerHTML = `<i class="fas fa-${
    isSuccess ? "check-circle" : "exclamation-circle"
  }"></i> ${msg}`;
  document.body.appendChild(n);

  setTimeout(() => n.classList.add("show"), 10);
  setTimeout(() => {
    n.classList.remove("show");
    setTimeout(() => n.remove(), 300);
  }, 4000);
}

// ====================== Add Unit Form ======================

const addUnitForm = document.getElementById("addUnitForm");
addUnitForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(addUnitForm);
  const price = Number(formData.get("priceForMonth"));
  const ownerId = Number(formData.get("ownerId_FK"));
  const title = formData.get("title").trim();
  const address = formData.get("address").trim();
  const ownerName = formData.get("ownerName").trim();

  // Input validation
  if (!title) {
    showNotification("Title is required", false);
    return;
  }
  if (price <= 0) {
    showNotification("Price must be a positive number", false);
    return;
  }
  if (!address) {
    showNotification("Address is required", false);
    return;
  }
  if (!ownerName) {
    showNotification("Owner name is required", false);
    return;
  }
  if (ownerId <= 0) {
    showNotification("Owner ID must be a positive number", false);
    return;
  }

  const unit = {
    id: 0,
    title,
    priceForMonth: price,
    photoUrls: formData.get("photoUrl")
      ? [formData.get("photoUrl").trim()]
      : [],
    address,
    status: formData.get("status"),
    ownerName,
    ownerId_FK: ownerId,
  };

  try {
    showLoading("unitsTable", "Adding unit...");
    await _post("/api/Unit", unit);
    showNotification("Unit added successfully", true);
    addUnitForm.reset();
    closeModal();
    await fetchUnits();
  } catch (error) {
    console.error("Add unit failed:", error);
    showNotification(`Failed to add unit: ${error.message}`, false);
  }
});

// ====================== Search Functionality ======================

function initSearch() {
  const searchInput = document.querySelector(".search-input");
  if (!searchInput) return;

  // Restore search query from sessionStorage
  const savedSearch = sessionStorage.getItem("unitSearchQuery") || "";
  searchInput.value = savedSearch;
  renderUnitsTable(savedSearch);

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    sessionStorage.setItem("unitSearchQuery", query);
    renderUnitsTable(query);
  });
}

// ====================== Event Delegation ======================

document.getElementById("unitsTable").addEventListener("click", (e) => {
  const target = e.target.closest("button");
  if (!target) return;

  const unitId = parseInt(target.dataset.unitId);
  if (!unitId) return;

  if (target.classList.contains("approve-btn")) {
    approveUnit(unitId);
  } else if (target.classList.contains("reject-btn")) {
    openRejectModal(unitId);
  } else if (target.classList.contains("view-btn")) {
    viewUnitDetails(unitId);
  } else if (target.classList.contains("delete-btn")) {
    deleteUnit(unitId);
  }
});

// ====================== Init ======================

document.addEventListener("DOMContentLoaded", () => {
  // Fetch initial data
  fetchUnits();
  fetchBookings();

  // Navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      document
        .querySelectorAll(".nav-item")
        .forEach((el) => el.classList.remove("active"));
      item.classList.add("active");

      const target = item.dataset.target;
      document.querySelectorAll(".content-section").forEach((section) => {
        section.classList.toggle("active", section.id === target);
      });
    });
  });

  // Menu toggle
  document.querySelector(".menu-toggle").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("active");
  });

  // Modal close on backdrop click
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) closeModal();
  });

  // Add unit button
  document.getElementById("addUnitBtn").addEventListener("click", () => {
    const modal = document.getElementById("addUnitModal");
    modal.classList.add("show");
  });

  // Refresh button
  document
    .querySelector(".btn-primary[onclick='fetchUnits()']")
    .addEventListener("click", fetchUnits);

  // Modal close buttons
  document
    .getElementById("addUnitModalClBtn")
    .addEventListener("click", closeModal);
  document.getElementById("closeBtn").addEventListener("click", closeModal);
  document
    .getElementById("unitModalTitleBtn")
    .addEventListener("click", closeModal);
  document
    .querySelectorAll(".close-modal")
    .forEach((btn) => btn.addEventListener("click", closeModal));

  // Initialize search
  initSearch();
});
