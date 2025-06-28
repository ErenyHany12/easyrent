import { _get, _post, _put, _delete } from "./apiClint.js";

// API Functions
export function addNewUnit(data) {
  return _post(`/api/Unit`, data);
}

export function getAllUnits() {
  return _get(`/api/Unit/GetAllUnits`);
}

export function getUnit(id) {
  return _get(`/api/Unit/${id}`);
}

export function uploadUnitPhoto(unitId, photoData) {
  return fetch(
    `https://easyrentapi0.runasp.net/api/Unit/${unitId}/upload-photos`,
    {
      method: "POST",
      body: photoData,
    }
  ).then((res) => res.json());
}

export function approveUnit(unitId) {
  return _put(`/api/Unit/ApproveUnit/${unitId}`);
}

export function deleteUnit(unitId) {
  return _delete(`/api/Unit/${unitId}`);
}

// UI Components
export function createUnitCard(unit) {
  return `
    <div class="room__card" data-id="${unit.id}">
      <div class="room__image">
        <img src="${
          unit.photoUrls?.$values?.[0]
            ? "https://easyrentapi0.runasp.net/" + unit.photoUrls.$values[0]
            : "images/default-unit.jpg"
        }" alt="${unit.title}" />
        <div class="room__price">
          <h3>${unit.priceForMonth} EGP</h3>
          <p>Per Month</p>
        </div>
      </div>
      <div class="room__details">
        <h4>${unit.title}</h4>
        <p class="room__location">
          <i class="ri-map-pin-line"></i> ${unit.address}
        </p>
        
        <!-- Main Features -->
        <div class="room__features grid grid-cols-3 gap-2 mb-4">
          <span class="flex flex-col items-center">
            <i class="ri-hotel-bed-line text-xl"></i>
            <span>${unit.bedrooms ?? "-"} Bedrooms</span>
          </span>
          <span class="flex flex-col items-center">
            <i class="ri-home-4-line text-xl"></i>
            <span>${unit.size ?? "-"} sqft</span>
          </span>
          <span class="flex flex-col items-center">
            <i class="ri-building-line text-xl"></i>
            <span>${unit.type ?? "-"}</span>
          </span>
        </div>
        
        <!-- Full Unit Details -->
        <div class="unit-full-details bg-gray-50 p-4 rounded-lg mb-4">
          <h5 class="text-lg font-semibold border-b pb-2 mb-3">Unit Specifications</h5>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Column 1 -->
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Property Type:</span>
                <span class="font-medium">${unit.type || "-"}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Furnishing:</span>
                <span class="font-medium">${
                  unit.isFurnished ? "Furnished" : "Not Furnished"
                }</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Floor Number:</span>
                <span class="font-medium">${unit.floorNumber || "-"}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Floors:</span>
                <span class="font-medium">${unit.totalFloors || "-"}</span>
              </div>
            </div>
            
            <!-- Column 2 -->
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Bathrooms:</span>
                <span class="font-medium">${unit.bathrooms || "-"}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Living Rooms:</span>
                <span class="font-medium">${unit.livingRooms || "-"}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Kitchens:</span>
                <span class="font-medium">${unit.kitchens || "-"}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Status:</span>
                <span class="font-medium">${unit.status || "-"}</span>
              </div>
            </div>
          </div>
          
          <!-- Amenities -->
          ${
            unit.amenities?.$values?.length > 0
              ? `
            <div class="mt-4">
              <h6 class="font-semibold mb-2">Amenities:</h6>
              <div class="flex flex-wrap gap-2">
                ${unit.amenities.$values
                  .map(
                    (amenity) => `
                  <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${amenity}</span>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
          
          <!-- Description -->
          ${
            unit.description
              ? `
            <div class="mt-4">
              <h6 class="font-semibold mb-2">Description:</h6>
              <p class="text-gray-700">${unit.description}</p>
            </div>
          `
              : ""
          }
        </div>
        
        <!-- Contact and Actions -->
        <div class="flex flex-col sm:flex-row gap-3 mt-4">
          <button class="btn view-details flex-1" data-id="${unit.id}">
            <i class="ri-eye-line mr-2"></i> View Details
          </button>
          <button class="btn btn-secondary flex-1 contact-owner" data-id="${
            unit.id
          }">
            <i class="ri-phone-line mr-2"></i> Contact Owner
          </button>
        </div>
      </div>
    </div>
  `;
}

export async function Units() {
  try {
    const units = await getAllUnits();
    console.log("[DEBUG] Raw units API response:", units);
    const data = units?.$values || [];

    if (data.length === 0) {
      return `<p class="text-center text-gray-500">No units available at the moment.</p>`;
    }

    return data.map((unit) => createUnitCard(unit)).join("");
  } catch (error) {
    console.error("Failed to load units:", error);
    return `<p class="text-red-500 text-center">Failed to load units. Please try again later.</p>`;
  }
}

export function UnitsSectionSkeleton() {
  return `
    <section id="units" class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Available Units</h2>
        <div id="unitCards" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${Array(3)
            .fill(
              `
            <div class="room__card skeleton">
              <div class="skeleton-image h-48 rounded-t-lg"></div>
              <div class="p-4 space-y-3">
                <div class="skeleton-line h-4 w-3/4"></div>
                <div class="skeleton-line h-4 w-1/2"></div>
                <div class="skeleton-line h-4 w-2/3"></div>
                <div class="skeleton-line h-10 w-full mt-4"></div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

// Event Handlers
export function initUnitDetails() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-details")) {
      const unitId = e.target.dataset.id;
      window.location.href = `unit-details.html?id=${unitId}`;
    }

    if (e.target.classList.contains("contact-owner")) {
      const unitId = e.target.dataset.id;
      // Implement contact owner functionality
      alert(`Contacting owner for unit ${unitId}`);
    }
  });
}

// Utility Functions
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
  }).format(amount);
}

export function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}
