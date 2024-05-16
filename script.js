const maxZoom = 19;

// Get the current location from the browser with as high accuracy as possible
navigator.geolocation.getCurrentPosition(
  (position) => drawMap([position.coords.latitude, position.coords.longitude], 18),
  (error) => drawMap([1.3521, 103.8198], 13),
);

async function drawMap([lat, lng], zoomLevel) {
  const map = L.map("map").setView([lat, lng], zoomLevel);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom }).addTo(map);
  showParkings([lat, lng]);
  // Whenever the map is moved, update the URL with the new coordinates
  map.on("moveend", () => {
    const center = map.getCenter();
    showParkings([center.lat, center.lng]);
  });

  L.control.locate().addTo(map);

  async function showParkings([lat, lng]) {
    // Fetch the parking locations from the API
    const url = "https://fetch.sanand.workers.dev/lta/BicycleParkingv2?" + new URLSearchParams({ Lat: lat, Long: lng });
    const data = await fetch(url).then((r) => r.json());
    // Remove all markers before adding new ones
    map.eachLayer((layer) => (layer instanceof L.Marker ? map.removeLayer(layer) : null));
    // Add marker at current location
    L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    })
      .addTo(map)
      .bindPopup("Showing bike parkings near here")
      .openPopup();
    // Add markers for each parking location
    data.value.forEach((d) => {
      L.marker([d.Latitude, d.Longitude]).addTo(map).bindPopup(`${d.Description} (${d.RackType}: ${d.RackCount})`);
    });
  }
}
