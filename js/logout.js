// Logout functionality
export function handleLogout() {
  // Show confirmation dialog
  Swal.fire({
    title: "تأكيد تسجيل الخروج",
    text: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#7c4dff",
    cancelButtonColor: "#d33",
    confirmButtonText: "نعم",
    cancelButtonText: "لا",
    customClass: {
      popup: 'rtl-popup',
      title: 'rtl-text',
      content: 'rtl-text'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Clear local storage
      localStorage.clear();

      // Update navigation before showing success message
      if (typeof updateNavigation === 'function') {
        updateNavigation();
      }

      // Show success message
      Swal.fire({
        title: "تم تسجيل الخروج!",
        text: "تم تسجيل خروجك بنجاح.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'rtl-popup',
          title: 'rtl-text',
          content: 'rtl-text'
        }
      }).then(() => {
        // Redirect to home page
        window.location.href = "index.html";
      });
    }
  });
}
