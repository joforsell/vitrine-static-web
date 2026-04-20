const SIGNUP_URL =
  "https://ybkxdgcahmgdjiudaxzw.supabase.co/functions/v1/signup";

const form = document.getElementById("signup-form");
const successMessage = document.getElementById("success-message");
const playStoreField = document.getElementById("play-store-field");
const platformInputs = form.querySelectorAll('input[name="platform"]');
const betaCheckbox = document.getElementById("beta");

function updatePlayStoreVisibility() {
  const platform = form.querySelector('input[name="platform"]:checked')?.value;
  const isBeta = betaCheckbox.checked;
  const show = isBeta && (platform === "android" || platform === "both");

  playStoreField.classList.toggle("hidden", !show);
}

platformInputs.forEach((input) =>
  input.addEventListener("change", updatePlayStoreVisibility)
);
betaCheckbox.addEventListener("change", updatePlayStoreVisibility);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const payload = {
    email: formData.get("email"),
    platform: formData.get("platform"),
    beta: formData.get("beta") === "yes",
    play_store_email: formData.get("play_store_email") || null,
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
