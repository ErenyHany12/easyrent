import { axiosClient } from "./apiClint.js";

export function addNewUnit(data) {
  return axiosClient.post(`/api/Unit`, JSON.stringify(data));
}

export function getAllUnits() {
  return axiosClient.get(`/api/Unit/GetAllUnits`);
}

export function getUnit(id) {
  return axiosClient.get(`/api/Unit/${id}`);
}

export function uploadUnitPhoto(unitId, photoData) {
  return axiosClient.post(`/api/Unit/${unitId}/upload-photos`, photoData);
}

export function approveUnit(unitId) {
  return axiosClient.put(`/api/Unit/ApproveUnit/${unitId}`);
}

export function deleteUnit(unitId) {
  return axiosClient.delete(`/api/Unit/${unitId}`);
}

export function createUnitCard(unit) {
  return `
    <div class="room__card" data-id="${unit.id}">
      <div class="room__image">
        <img src="${unit.photos?.[0]?.url || "images/default-unit.jpg"}" alt="${
    unit.title
  }" />
        <div class="room__price">
          <h3>${unit.price} EGP</h3>
          <p>Per Month</p>
        </div>
      </div>
      <div class="room__details">
        <h4>${unit.title}</h4>
        <p class="room__location">
          <i class="ri-map-pin-line"></i> ${unit.location}
        </p>
        <div class="room__features">
          <span>
            <i class="ri-hotel-bed-line"></i> ${unit.bedrooms} Bedroom(s)
          </span>
          <span>
            <i class="ri-home-4-line"></i> ${unit.size} sqft
          </span>
          <span>
            <i class="ri-building-line"></i> ${unit.type}
          </span>
        </div>
        <button class="btn view-details" data-id="${
          unit.id
        }">View Details</button>
      </div>
    </div>
  `;
}

export async function Units() {
  try {
    const response = await getAllUnits();
    const units = response.data?.$values || [];

    if (units.length === 0) {
      return `<p class="text-center text-gray-500">No units available at the moment.</p>`;
    }

    return units.map((unit) => createUnitCard(unit)).join("");
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

// دالة مساعدة لمعالجة النقر على عرض التفاصيل
export function initUnitDetails() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-details")) {
      const unitId = e.target.dataset.id;
      window.location.href = `unit-details.html?id=${unitId}`;
    }
  });
}
