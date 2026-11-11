const list = document.getElementById("list");
const filter = document.getElementById("filter");

// Fill the 4 number boxes at the top
function showStats(all) {
  function count(status) {
    return all.filter(function (b) {
      return b.status === status;
    }).length;
  }
  document.getElementById("statTotal").textContent = all.length;
  document.getElementById("statPending").textContent = count("pending");
  document.getElementById("statScheduled").textContent = count("scheduled");
  document.getElementById("statCollected").textContent = count("collected");
}

function showBookings() {
  const all = getBookings();
  showStats(all);

  // newest first, then apply the filter
  let bookings = all.slice().reverse();
  if (filter.value !== "all") {
    bookings = bookings.filter(function (b) {
      return b.status === filter.value;
    });
  }

  if (bookings.length === 0) {
    list.innerHTML = "<div class='card-box empty'>No bookings found.</div>";
    return;
  }

  list.innerHTML = "";
  bookings.forEach(function (b) {
    const card = document.createElement("div");
    card.className = "card-box";
    card.innerHTML = `
      <div class="card-top">
        <b>${escapeHtml(b.id)} · ${escapeHtml(b.service)} (₹${b.price})</b>
        ${statusBadge(b.status)}
      </div>
      <p><b>${escapeHtml(b.name)}</b> · ${escapeHtml(b.phone)}</p>
      <p>${escapeHtml(b.address)}, ${escapeHtml(b.area)}</p>
      <p>${formatDate(b.date)}, ${escapeHtml(b.slot)}</p>
      ${b.notes ? "<p><i>Note: " + escapeHtml(b.notes) + "</i></p>" : ""}
      <div class="card-actions">
        <select onchange="changeStatus('${b.id}', this.value)">
          <option value="pending" ${b.status === "pending" ? "selected" : ""}>pending</option>
          <option value="scheduled" ${b.status === "scheduled" ? "selected" : ""}>scheduled</option>
          <option value="collected" ${b.status === "collected" ? "selected" : ""}>collected</option>
          <option value="cancelled" ${b.status === "cancelled" ? "selected" : ""}>cancelled</option>
        </select>
        <button class="btn-danger" onclick="deleteBooking('${b.id}')">Delete</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function changeStatus(id, newStatus) {
  const bookings = getBookings();
  const booking = bookings.find(function (b) {
    return b.id === id;
  });
  booking.status = newStatus;
  saveBookings(bookings);
  showBookings();
}

function deleteBooking(id) {
  if (!confirm("Delete this booking for good?")) return;
  const bookings = getBookings().filter(function (b) {
    return b.id !== id;
  });
  saveBookings(bookings);
  showBookings();
}

filter.addEventListener("change", showBookings);
showBookings();
