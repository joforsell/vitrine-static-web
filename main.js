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
  // Prefill handle from ?handle= query param (e.g. arriving from app.vitrineminis.com/u/<handle>)
  const prefillHandle = new URLSearchParams(window.location.search).get("handle");
  const handleField = document.getElementById("reservation-handle");
  if (prefillHandle && handleField && !handleField.value) {
    const normalised = prefillHandle.toLowerCase().slice(0, 30);
    if (/^[a-z0-9_-]{3,30}$/.test(normalised)) {
      handleField.value = normalised;
    }
  }

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
