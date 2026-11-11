const BUSINESS_NUMBER = "919876543210"; // your WhatsApp number: 91 + 10 digits

// Price of each service
const prices = {
  "Dry Waste": 49,
  "Wet Waste": 49,
  "Mixed Waste": 59,
  "Bulk Waste": 299,
};

// Find things on the page
const form = document.getElementById("pickupForm");
const serviceBox = document.getElementById("service");
const priceBox = document.getElementById("price");
const dateBox = document.getElementById("date");

// Do not allow dates in the past
dateBox.min = todayString();

// If the user clicked "Book" on a service card, select that service
const params = new URLSearchParams(window.location.search);
const chosenService = params.get("service");
if (chosenService && prices[chosenService]) {
  serviceBox.value = chosenService;
}

// Show the price of the selected service
function updatePrice() {
  priceBox.textContent = "₹" + prices[serviceBox.value];
}
serviceBox.addEventListener("change", updatePrice);
updatePrice();

// When the form is submitted
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  const booking = {
    id: "CD" + Date.now().toString().slice(-6), // example: CD482913
    service: serviceBox.value,
    price: prices[serviceBox.value],
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    area: document.getElementById("area").value.trim(),
    date: dateBox.value,
    slot: document.getElementById("slot").value,
    notes: document.getElementById("notes").value.trim(),
    status: "pending",
  };

  // Add to the saved list
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);

  // Hide the form and show the success box
  form.hidden = true;
  document.getElementById("newId").textContent = booking.id;

  // WhatsApp button (only if you added it earlier)
  const waLink = document.getElementById("waLink");
  if (waLink && typeof whatsappLink === "function") {
    const text =
      "Hello, I booked a pickup.\n" +
      "Booking ID: " +
      booking.id +
      "\n" +
      "Service: " +
      booking.service +
      "\n" +
      "Name: " +
      booking.name +
      "\n" +
      "Date: " +
      formatDate(booking.date) +
      ", " +
      booking.slot +
      "\n" +
      "Address: " +
      booking.address +
      ", " +
      booking.area;
    waLink.href = whatsappLink(BUSINESS_NUMBER, text);
  }

  document.getElementById("success").hidden = false;
});
ki;
