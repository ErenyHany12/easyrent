// API Configuration
const API_BASE_URL = "https://easyrentapi0.runasp.net/api";

// DOM Elements
const studentBtn = document.getElementById("selectStudent");
const ownerBtn = document.getElementById("selectOwner");
const studentForm = document.getElementById("studentForm");
const ownerForm = document.getElementById("ownerForm");
const uniSelect = document.getElementById("universityId");
const collegeSelect = document.getElementById("collegeId");

let allColleges = [];

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initSignUpEvents();
  loadUniversitiesAndColleges();
  studentBtn.click(); // Default to student form
});

// ==================== API FUNCTIONS ====================

async function getAllUniversities() {
  try {
    const response = await fetch(`${API_BASE_URL}/University`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch universities");
    }
    const data = await response.json();
    return data.$values || data;
  } catch (error) {
    console.error("University API Error:", error);
    showError("Failed to load universities. Please try again later.");
    return [];
  }
}

async function getAllColleges() {
  try {
    const response = await fetch(`${API_BASE_URL}/Colleges`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch colleges");
    }
    const data = await response.json();
    return data.$values || data;
  } catch (error) {
    console.error("College API Error:", error);
    showError("Failed to load colleges. Please try again later.");
    return [];
  }
}

async function registerStudent(studentData) {
  try {
    console.log("Submitting student data:", studentData);
    const response = await fetch(`${API_BASE_URL}/Student/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = "Registration failed";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.title || responseText;
      } catch {
        errorMessage = responseText;
      }
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return { message: "Registration successful!" };
    }
  } catch (error) {
    console.error("Student Registration Error:", error);
    throw error;
  }
}

async function registerOwner(ownerData) {
  try {
    console.log("Submitting owner data:", ownerData);
    const response = await fetch(`${API_BASE_URL}/Owner/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ownerData),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = "Registration failed";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.title || responseText;
      } catch {
        errorMessage = responseText;
      }
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return { message: "Registration successful!" };
    }
  } catch (error) {
    console.error("Owner Registration Error:", error);
    throw error;
  }
}

// ==================== MAIN FUNCTIONS ====================

async function loadUniversitiesAndColleges() {
  try {
    showLoading(true);
    const [universities, colleges] = await Promise.all([
      getAllUniversities(),
      getAllColleges(),
    ]);
    allColleges = colleges;
    populateUniversityDropdown(universities);
  } catch (error) {
    console.error("Loading Error:", error);
    showError("Failed to load data. Please refresh the page.");
  } finally {
    showLoading(false);
  }
}

function populateUniversityDropdown(universities) {
  uniSelect.innerHTML =
    '<option disabled selected value="">Select university</option>';
  universities.forEach((university) => {
    const option = document.createElement("option");
    option.value = university.id;
    option.textContent = university.name;
    uniSelect.appendChild(option);
  });
}

function initSignUpEvents() {
  // University selection handler
  uniSelect.addEventListener("change", function () {
    const selectedUniId = parseInt(this.value);
    const universityName = this.options[this.selectedIndex].text;
    collegeSelect.innerHTML =
      "<option disabled selected>Select faculty</option>";

    const filteredColleges = allColleges.filter(
      (college) =>
        college.universityId === selectedUniId ||
        college.universityName === universityName
    );

    filteredColleges.forEach((college) => {
      const option = document.createElement("option");
      option.value = college.id;
      option.textContent = college.name;
      collegeSelect.appendChild(option);
    });
  });

  // Form submissions
  studentForm.addEventListener("submit", handleStudentSubmit);
  ownerForm.addEventListener("submit", handleOwnerSubmit);

  // Role selection buttons
  studentBtn.addEventListener("click", () => {
    toggleForms(studentForm, ownerForm, studentBtn, ownerBtn, "indigo");
  });

  ownerBtn.addEventListener("click", () => {
    toggleForms(ownerForm, studentForm, ownerBtn, studentBtn, "yellow");
  });

  // Password visibility toggles
  setupPasswordToggle("studentPassword", "toggleStudentPassword");
  setupPasswordToggle("ownerPassword", "toggleOwnerPassword");

  // Password generators
  document
    .getElementById("generateStudentPass")
    .addEventListener("click", () => {
      document.getElementById("studentPassword").value = generatePassword();
    });

  document.getElementById("generateOwnerPass").addEventListener("click", () => {
    document.getElementById("ownerPassword").value = generatePassword();
  });
}

// ==================== FORM HANDLERS ====================

async function handleStudentSubmit(e) {
  e.preventDefault();

  // Validate required fields
  const requiredFields = [
    "studentFullName",
    "studentEmail",
    "studentUserName",
    "studentPassword",
    "studentPhone",
    "studentAddress",
    "universityId",
    "collegeId",
  ];

  for (const fieldId of requiredFields) {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      showError(`Please fill in ${field.labels[0].textContent}`);
      field.focus();
      return;
    }
  }

  // Validate email format
  const email = document.getElementById("studentEmail").value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("Please enter a valid email address");
    return;
  }

  // Validate password length
  const password = document.getElementById("studentPassword").value;
  if (password.length < 8) {
    showError("Password must be at least 8 characters");
    return;
  }

  // Validate university/college selection
  const universityId = parseInt(document.getElementById("universityId").value);
  const collegeId = parseInt(document.getElementById("collegeId").value);
  if (isNaN(universityId) || isNaN(collegeId)) {
    showError("Please select both university and faculty");
    return;
  }

  const studentData = {
    name: document.getElementById("studentFullName").value.trim(),
    email: email,
    userName: document.getElementById("studentUserName").value.trim(),
    password: password,
    phoneNumber: document.getElementById("studentPhone").value.trim(),
    address: document.getElementById("studentAddress").value.trim(),
    universityId: universityId,
    collegeId: collegeId,
  };

  try {
    showLoading(true, "studentForm");
    const result = await registerStudent(studentData);
    showSuccess(result.message || "Registration successful!");
    setTimeout(() => (window.location.href = "/login"), 1500);
  } catch (error) {
    let errorMessage = error.message;
    if (errorMessage.includes("Email") || errorMessage.includes("Password")) {
      errorMessage = errorMessage
        .replace("Validation failed:", "")
        .replace(/--/g, "\n• ")
        .trim();
    }
    showError(
      errorMessage || "Registration failed. Please check your details."
    );
  } finally {
    showLoading(false, "studentForm");
  }
}

async function handleOwnerSubmit(e) {
  e.preventDefault();

  // Validate required fields
  const requiredFields = [
    "ownerLegalName",
    "ownerEmail",
    "ownerUsername",
    "ownerPassword",
    "ownerPhone",
    "ownerLocation",
  ];

  for (const fieldId of requiredFields) {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      showError(`Please fill in ${field.labels[0].textContent}`);
      field.focus();
      return;
    }
  }

  // Validate email format
  const email = document.getElementById("ownerEmail").value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("Please enter a valid email address");
    return;
  }

  // Validate password length
  const password = document.getElementById("ownerPassword").value;
  if (password.length < 8) {
    showError("Password must be at least 8 characters");
    return;
  }

  const ownerData = {
    name: document.getElementById("ownerLegalName").value.trim(),
    email: email,
    userName: document.getElementById("ownerUsername").value.trim(),
    password: password,
    phoneNumber: document.getElementById("ownerPhone").value.trim(),
    address: document.getElementById("ownerLocation").value.trim(),
  };

  try {
    showLoading(true, "ownerForm");
    const result = await registerOwner(ownerData);
    showSuccess(result.message || "Registration successful!");
    setTimeout(() => (window.location.href = "../owner/loginowner.html"), 1500);
  } catch (error) {
    let errorMessage = error.message;
    if (errorMessage.includes("Email") || errorMessage.includes("Password")) {
      errorMessage = errorMessage
        .replace("Validation failed:", "")
        .replace(/--/g, "\n• ")
        .trim();
    }
    showError(
      errorMessage || "Registration failed. Please check your details."
    );
  } finally {
    showLoading(false, "ownerForm");
  }
}

// ==================== UTILITY FUNCTIONS ====================

function toggleForms(showForm, hideForm, activeBtn, inactiveBtn, color) {
  showForm.classList.remove("hidden");
  hideForm.classList.add("hidden");
  activeBtn.classList.add(`ring-${color}-500`, "ring-2");
  inactiveBtn.classList.remove("ring-2", "ring-indigo-500", "ring-yellow-500");
}

function setupPasswordToggle(inputId, toggleBtnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(toggleBtnId);

  btn.addEventListener("click", () => {
    const icon = btn.querySelector("i");
    input.type = input.type === "password" ? "text" : "password";
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });
}

function generatePassword() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function showLoading(isLoading, formId = null) {
  if (formId) {
    const form = document.getElementById(formId);
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = isLoading;
      const originalText =
        submitBtn.dataset.originalText || submitBtn.textContent;
      submitBtn.dataset.originalText = originalText;
      submitBtn.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Processing...'
        : originalText;
    }
  }
}

function showSuccess(message) {
  const notification = document.createElement("div");
  notification.className = "notification success";
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function showError(message) {
  const notification = document.createElement("div");
  notification.className = "notification error";
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}
