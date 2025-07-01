document.addEventListener("DOMContentLoaded", function () {
  const API_BASE_URL = "https://easyrentapi0.runasp.net/api";

  const loginForm = document.getElementById("loginForm");
  const emailPhoneInput = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const submitBtn = document.querySelector("button[type='submit']");
  const successMessage = document.getElementById("successMessage");

  // Create error display
  let errorDiv = document.querySelector(".error-message");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    loginForm.insertBefore(errorDiv, loginForm.firstChild);
  }

  // Show/hide password
  togglePasswordBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePasswordBtn.textContent = type === "password" ? "Show" : "Hide";
  });

  // Handle login
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorDiv.style.display = "none";
    successMessage.style.display = "none";

    const userType = document.querySelector(
      'input[name="userType"]:checked'
    ).value;
    const credentials = {
      emailOrPhone: emailPhoneInput.value.trim(),
      password: passwordInput.value,
    };

    if (!credentials.emailOrPhone || !credentials.password) {
      showError("Please fill in all fields");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Signing in...';

    try {
      let endpoint, redirectUrl;

      switch (userType) {
        case "owner":
          endpoint = "/Owner/login";
          redirectUrl = "owner/myproperty.html";
          break;
        case "admin":
          endpoint = "/Admin/login";
          redirectUrl = "Admin/dashbordAdim.html";
          break;
        case "student":
          endpoint = "/Student/login";
          redirectUrl = "room2.html";
          break;
        default:
          throw new Error("Invalid user type");
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage =
          errorData.message || "Login failed. Please check your credentials.";
        if (response.status === 401) {
          errorMessage = `Invalid ${userType} credentials`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Login response:", data);

      localStorage.setItem("authToken", data.token || data.accessToken);
      localStorage.setItem("userType", userType);
      localStorage.setItem("userData", JSON.stringify(data.user || data));

      // ✅ Student-specific data
      if (userType === "student") {
        localStorage.setItem("studentId", data.id || data.studentId);
        localStorage.setItem(
          "studentName",
          data.fullName || data.name || "Student"
        );
      }

      // ✅ Owner-specific data
      if (userType === "owner" && data.ownerId) {
        localStorage.setItem("ownerId", data.ownerId);
        if (data.ownerName) {
          localStorage.setItem("ownerName", data.ownerName);
        }
      }

      successMessage.style.display = "flex";
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      showError(error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  });

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    setTimeout(() => {
      errorDiv.style.display = "none";
    }, 5000);
  }

  document.querySelectorAll('input[name="userType"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      document.querySelectorAll(".user-type-option").forEach((option) => {
        option.classList.remove("selected");
      });
      if (this.checked) {
        this.closest(".user-type-option").classList.add("selected");
      }
    });
  });
});

// 🔔 Optional global notification
function showNotification(message, isSuccess = true) {
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.innerHTML = `
      <i class="fas ${
        isSuccess ? "fa-check-circle" : "fa-exclamation-circle"
      }"></i>
      <span id="notification-message"></span>
    `;
    document.body.appendChild(notification);

    const style = document.createElement("style");
    style.textContent = `
      #notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        display: none;
        align-items: center;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease, opacity 0.3s ease;
      }
      #notification.show {
        transform: translateX(0);
      }
      #notification.success {
        background-color: #4CAF50;
      }
      #notification.error {
        background-color: #F44336;
      }
      #notification i {
        margin-right: 10px;
      }
    `;
    document.head.appendChild(style);
  }

  const messageEl = document.getElementById("notification-message");
  const icon = notification.querySelector("i");

  messageEl.textContent = message;
  notification.className = isSuccess ? "success" : "error";
  icon.className = `fas ${
    isSuccess ? "fa-check-circle" : "fa-exclamation-circle"
  }`;

  notification.style.display = "flex";
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.style.display = "none";
    }, 300);
  }, 4000);
}
