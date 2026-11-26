const GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/MVNTbGV6vwXPC5D4brNg/webhook-trigger/922c80ee-c1a5-42a7-84f1-3b286d4a4d4d";

const form = document.querySelector("#audit-form");
const statusEl = document.querySelector(".form-status");

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.dataset.status = type;
}

function formPayload(formData) {
  const payload = Object.fromEntries(formData.entries());
  payload.page_url = window.location.href;
  payload.submitted_at = new Date().toISOString();

  const params = new URLSearchParams(window.location.search);
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"].forEach((key) => {
    const value = params.get(key);
    if (value) payload[key] = value;
  });

  return payload;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const webhookUrl = form.dataset.ghlWebhook || GHL_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl.includes("PASTE")) {
    setStatus("Add your HighLevel webhook URL to connect this form.", "error");
    return;
  }

  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  setStatus("Sending your audit request...", "pending");

  try {
    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPayload(new FormData(form))),
    });

    form.reset();
    setStatus("Request sent. We will follow up shortly.", "success");
  } catch (error) {
    setStatus("The form could not send. Please try again.", "error");
  } finally {
    submitButton.disabled = false;
  }
});
