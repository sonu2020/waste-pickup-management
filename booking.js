const searchForm = document.getElementById("searchForm");
const list = document.getElementById("list");
let currentPhone = "";

function showMyBookings() {
  const mine = getBookings()
    .filter(function (b) {
      return b.phone === currentPhone;
    })
    .reverse(); // newest first

  if (mine.length === 0) {
    list.innerHTML =
      "<div class='card-box empty'>No bookings found for this number.</div>";
    return;
  }

  list.innerHTML = "";
  mine.forEach(function (b) {
    const card = document.createElement("div");
    card.className = "card-box";

    // Only pending bookings can be cancelled
    let cancelButton = "";
    if (b.status === "pending") {
      cancelButton = `<button class="btn-danger" onclick="cancelBooking('${b.id}')">Cancel booking</button>`;
    }

    card.innerHTML = `
      <div class="card-top">
        <b>${escapeHtml(b.id)}</b>
        ${statusBadge(b.status)}
      </div>
      <p><b>${escapeHtml(b.service)}</b> (₹${b.price})</p>
      <p>${formatDate(b.date)}, ${escapeHtml(b.slot)}</p>
      <p>${escapeHtml(b.address)}, ${escapeHtml(b.area)}</p>
      ${cancelButton}
    `;
    list.appendChild(card);
  });
}

function cancelBooking(id) {
  if (!confirm("Cancel this booking?")) return;

  const bookings = getBookings();
  const booking = bookings.find(function (b) {
    return b.id === id;
  });
  booking.status = "cancelled";
  saveBookings(bookings);
  showMyBookings();
}

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  currentPhone = document.getElementById("phone").value.trim();
  showMyBookings();
});
