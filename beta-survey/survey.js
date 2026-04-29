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

  const answers = [];

  // Rating questions
  const limitsFairness = formData.get("limits_fairness");
  if (limitsFairness) {
    answers.push({
      question_key: "limits_fairness",
      answer_rating: parseInt(limitsFairness),
    });
  }

  const pricingLikelihood = formData.get("pricing_likelihood");
  if (pricingLikelihood) {
    answers.push({
      question_key: "pricing_likelihood",
      answer_rating: parseInt(pricingLikelihood),
    });
  }

  // Plan choice
  const planChoice = formData.get("plan_choice");
  if (planChoice) {
    answers.push({ question_key: "plan_choice", answer_text: planChoice });
  }

  // Text questions
  const textFields = [
    "fair_limits",
    "fair_pricing",
    "best_feature",
    "open_ended",
  ];
  for (const key of textFields) {
    const value = formData.get(key)?.trim();
    if (value) {
      answers.push({ question_key: key, answer_text: value });
    }
  }

  const payload = {
    waitlist_id: waitlistId,
    answers,
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
    } else {
      const data = await res.json().catch(() => null);

      if (data?.error === "already_submitted") {
        form.classList.add("hidden");
        alreadySubmitted.classList.remove("hidden");
      } else if (data?.error === "invalid_waitlist_id") {
        form.classList.add("hidden");
        errorState.classList.remove("hidden");
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
