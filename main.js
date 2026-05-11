const SIGNUP_URL =
  "https://ybkxdgcahmgdjiudaxzw.supabase.co/functions/v1/signup";

const form = document.getElementById("signup-form");
const successMessage = document.getElementById("success-message");

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
