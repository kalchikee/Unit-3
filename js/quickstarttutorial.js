/* Leaflet Quick Start Guide Tutorial */

// L.map() - Creates a map instance and assigns it to the variable 'map'
// setView() - Sets the geographical center and initial zoom level of the map
var map = L.map('mapid').setView([51.505, -0.09], 13);

// L.tileLayer() - Adds a tile layer (base map) to the map
// Using OpenStreetMap tiles (free alternative to Mapbox)
//Example 1.1 line 5...add tile layer
var tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'your.mapbox.project.id',
    accessToken: 'your.mapbox.public.access.token'
});

tileLayer.addTo(map);
// Alternative Mapbox tile layer (requires API key - commented out)
/*
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'your.mapbox.project.id',
    accessToken: 'your.mapbox.public.access.token'
}).addTo(map);
*/

// L.marker() - Creates a marker at the specified coordinates [lat, lng]
// addTo() - Adds the marker to the map
var marker = L.marker([51.5, -0.09]).addTo(map);

// L.circle() - Creates a circle overlay with specified center, styling, and radius
// addTo() - Adds the circle to the map
var circle = L.circle([51.508, -0.11], {
    color: 'red',           // Border color
    fillColor: '#f03',      // Fill color
    fillOpacity: 0.5,       // Fill transparency (0-1)
    radius: 500             // Radius in meters
}).addTo(map);

// L.polygon() - Creates a polygon from an array of coordinate points
// addTo() - Adds the polygon to the map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

// bindPopup() - Attaches a popup with HTML content to the marker
// openPopup() - Immediately opens the popup
marker.bindPopup("<strong>Hello world!</strong><br />I am a popup.").openPopup();

// bindPopup() - Attaches popups to the circle and polygon
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

// L.popup() - Creates a standalone popup
// setLatLng() - Sets the popup's position
// setContent() - Sets the popup's content
// openOn() - Opens the popup on the specified map
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

// Create another popup variable for map click events
var popup = L.popup();

// onMapClick() - Event handler function for map clicks
// e.latlng - Contains the coordinates where the user clicked
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

// on() - Attaches an event listener to the map
// 'click' - The event type to listen for
// onMapClick - The function to call when the event occurs
map.on('click', onMapClick);