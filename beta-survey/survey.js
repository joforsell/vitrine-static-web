const SURVEY_URL =
  "https://ybkxdgcahmgdjiudaxzw.supabase.co/functions/v1/submit-beta-survey";

const form = document.getElementById("survey-form");
const errorState = document.getElementById("error-state");
const alreadySubmitted = document.getElementById("already-submitted");
const thankYou = document.getElementById("thank-you");

const waitlistId = new URLSearchParams(window.location.search).get("id");

if (!waitlistId) {
  errorState.classList.remove("hidden");
} else {
  form.classList.remove("hidden");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  const formData = new FormData(form);

  const payload = {
    waitlist_id: waitlistId,
    limits_fairness: parseInt(formData.get("limits_fairness")) || null,
    fair_limits: formData.get("fair_limits")?.trim() || null,
    pricing_likelihood: parseInt(formData.get("pricing_likelihood")) || null,
    plan_choice: formData.get("plan_choice") || null,
    fair_pricing: formData.get("fair_pricing")?.trim() || null,
    best_feature: formData.get("best_feature")?.trim() || null,
    open_ended: formData.get("open_ended")?.trim() || null,
  };

  try {
    const res = await fetch(SURVEY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      form.classList.add("hidden");
      thankYou.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const data = await res.json().catch(() => null);

      if (data?.error === "already_submitted") {
        form.classList.add("hidden");
        alreadySubmitted.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (data?.error === "invalid_waitlist_id") {
        form.classList.add("hidden");
        errorState.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert(data?.error ?? "Something went wrong. Please try again.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit feedback";
      }
    }
  } catch {
    alert("Network error. Please try again.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit feedback";
  }
});
