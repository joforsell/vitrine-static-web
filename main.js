const SIGNUP_URL =
  "https://ybkxdgcahmgdjiudaxzw.supabase.co/functions/v1/signup";
const RESERVATION_URL =
  "https://ybkxdgcahmgdjiudaxzw.supabase.co/functions/v1/reserve-handle";

const form = document.getElementById("signup-form");
const successMessage = document.getElementById("success-message");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const payload = {
      email: formData.get("email"),
      platform: formData.get("platform"),
      beta: false,
      play_store_email: null,
      company: formData.get("company"), // honeypot
    };

    try {
      const res = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        form.classList.add("hidden");
        successMessage.classList.remove("hidden");
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
  });
}

const reservationForm = document.getElementById("reservation-form");
const reservationSuccess = document.getElementById("reservation-success");
const reservationError = document.getElementById("reservation-error");

function showReservationError(message) {
  if (reservationError) {
    reservationError.textContent = message;
    reservationError.classList.remove("hidden");
  } else {
    alert(message);
  }
}

function clearReservationError() {
  if (reservationError) {
    reservationError.textContent = "";
    reservationError.classList.add("hidden");
  }
}

if (reservationForm) {
  reservationForm.addEventListener("input", clearReservationError);

  reservationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!reservationForm.reportValidity()) return;

    clearReservationError();

    const formData = new FormData(reservationForm);

    const payload = {
      email: formData.get("email"),
      handle: formData.get("handle"),
      display_name: formData.get("display_name") || null,
      bio: formData.get("bio") || null,
      company: formData.get("company"), // honeypot
    };

    try {
      const res = await fetch(RESERVATION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        reservationForm.classList.add("hidden");
        reservationSuccess.classList.remove("hidden");
      } else {
        const data = await res.json().catch(() => null);
        showReservationError(
          data?.error ?? "Something went wrong. Please try again."
        );
      }
    } catch {
      showReservationError("Network error. Please try again.");
    }
  });
}
