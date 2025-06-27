import { _get, _post, _put, _delete } from "./apiClint.js";

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
  // لو ترفع FormData لازم دالة خاصة:
  return fetch(
    `https://easyrentapi0.runasp.net/api/Unit/${unitId}/upload-photos`,
    {
      method: "POST",
      body: photoData, // بدون Content-Type, المتصفح يحددها
    }
  ).then((res) => res.json());
}

export function approveUnit(unitId) {
  return _put(`/api/Unit/ApproveUnit/${unitId}`);
}

export function deleteUnit(unitId) {
  return _delete(`/api/Unit/${unitId}`);
}

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
        <div class="room__features">
          <span>
            <i class="ri-hotel-bed-line"></i> ${unit.bedrooms ?? "-"} Bedroom(s)
          </span>
          <span>
            <i class="ri-home-4-line"></i> ${unit.size ?? "-"} sqft
          </span>
          <span>
            <i class="ri-building-line"></i> ${unit.type ?? "-"}
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

export function initUnitDetails() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-details")) {
      const unitId = e.target.dataset.id;
      window.location.href = `unit-details.html?id=${unitId}`;
    }
  });
}
