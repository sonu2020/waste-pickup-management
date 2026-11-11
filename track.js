const trackForm = document.getElementById("trackForm");
const result = document.getElementById("result");

// The 3 steps of a pickup
const steps = ["pending", "scheduled", "collected"];
const stepNames = ["Requested", "Scheduled", "Collected"];

trackForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const id = document.getElementById("bookingId").value.trim().toUpperCase();
  const phone = document.getElementById("phone").value.trim();

  // Look for a booking with this ID and phone
  const booking = getBookings().find(function (b) {
    return b.id === id && b.phone === phone;
  });

  if (!booking) {
    result.innerHTML =
      "<div class='card-box empty'>No booking found. Check the ID and phone number.</div>";
    return;
  }

  // Build the progress bar
  let progress = "";
  if (booking.status === "cancelled") {
    progress = "<p class='cancelled-note'>This booking was cancelled.</p>";
  } else {
    const current = steps.indexOf(booking.status);
    progress = "<div class='progress'>";
    stepNames.forEach(function (name, i) {
      const done = i <= current ? "done" : "";
      progress += `<div class="progress-step ${done}"><span>${i + 1}</span>${name}</div>`;
    });
    progress += "</div>";
  }

  result.innerHTML = `
    <div class="card-box">
      <div class="card-top">
        <b>${escapeHtml(booking.id)}</b>
        ${statusBadge(booking.status)}
      </div>
      ${progress}
      <p><b>Service:</b> ${escapeHtml(booking.service)} (₹${booking.price})</p>
      <p><b>Date:</b> ${formatDate(booking.date)}, ${escapeHtml(booking.slot)}</p>
      <p><b>Address:</b> ${escapeHtml(booking.address)}, ${escapeHtml(booking.area)}</p>
    </div>
  `;
});
