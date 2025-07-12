/* Interactive Web Map for Unit 2 - Activity 6 */

// Declare map and minValue in global scope
var map;
var minValue;

// Step 1: Create the Leaflet map
function createMap() {
    map = L.map('map', {
        center: [40, -95],
        zoom: 4
    });

    // Add OpenTopoMap tile layer
    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }).addTo(map);

    // Call getData function
    getData();
}

// Step 2: Import GeoJSON data
function getData() {
    fetch("data/MegaCities.geojson")
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            // Step 3: build an attributes array from the data
            var attributes = processData(json);
            minValue = calculateMinValue(json);
            // Call function to create proportional symbols
            createPropSymbols(json, attributes);
            // Create sequence controls
            createSequenceControls(attributes);

            // --- ADD THIS BLOCK FOR THE OVERLAY OPERATOR ---
            fetch("data/overlay.geojson")
                .then(response => response.json())
                .then(overlayData => {
                    var overlayLayer = L.geoJson(overlayData, {
                        style: {
                            color: "blue",
                            weight: 2,
                            fill: false
                        }
                    });

                    // Add overlay control to the map
                    var overlayMaps = {
                        "Overlay Layer": overlayLayer
                    };
                    L.control.layers(null, overlayMaps).addTo(map);
                });
            // --- END OVERLAY BLOCK ---
        });
}

// Step 3: build an attributes array from the data
function processData(data) {
    var attributes = [];
    var properties = data.features[0].properties;
    for (var attribute in properties) {
        if (attribute.indexOf("Pop") > -1) {
            attributes.push(attribute);
        }
    }
    return attributes;
}

// Calculate the minimum value among all attributes for scaling
function calculateMinValue(data) {
    var allValues = [];
    for (var city of data.features) {
        for (var year = 1985; year <= 2015; year += 5) {
            var value = Number(city.properties["Pop_" + String(year)]);
            if (!isNaN(value)) {
                allValues.push(value);
            }
        }
    }
    return Math.min(...allValues);
}

// Calculate the radius of each proportional symbol using Flannery scaling
function calcPropRadius(attValue) {
    var minRadius = 5;
    var radius = 1.0083 * Math.pow(attValue / minValue, 0.5715) * minRadius;
    return radius;
}

// Function to convert markers to circle markers with popups
function pointToLayer(feature, latlng, attributes, attribute) {
    attribute = attribute || attributes[0];

    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var attValue = Number(feature.properties[attribute]);
    options.radius = calcPropRadius(attValue);

    var layer = L.circleMarker(latlng, options);

    // Styled popup content
    var year = attribute.split("_")[1];
    var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>";
    popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " million</p>";

    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -options.radius)
    });

    return layer;
}

// Step 3: Add circle markers for point features to the map
function createPropSymbols(data, attributes) {
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return pointToLayer(feature, latlng, attributes, attributes[0]);
        }
    }).addTo(map);
}

// Step 1: Create new sequence controls
function createSequenceControls(attributes) {
    // Create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend', slider);

    // Set slider attributes
    document.querySelector(".range-slider").max = attributes.length - 1;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    // Add step buttons
    document.querySelector('#panel').insertAdjacentHTML('beforeend', '<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend', '<button class="step" id="forward">Forward</button>');

    // Step 5: click listener for buttons
    document.querySelectorAll('.step').forEach(function(step) {
        step.addEventListener("click", function() {
            var index = Number(document.querySelector('.range-slider').value);

            if (step.id == 'forward') {
                index++;
                index = index > attributes.length - 1 ? 0 : index;
            } else if (step.id == 'reverse') {
                index--;
                index = index < 0 ? attributes.length - 1 : index;
            }

            document.querySelector('.range-slider').value = index;
            updatePropSymbols(attributes[index]);
        });
    });

    // Step 5: input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function() {
        var index = this.value;
        updatePropSymbols(attributes[index]);
    });
}

// Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute) {
    map.eachLayer(function(layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            var props = layer.feature.properties;
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            var popupContent = "<p><b>City:</b> " + props.City + "</p>";
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";

            var popup = layer.getPopup();
            popup.setContent(popupContent).update();
        }
    });
}

function createSequenceControls(attributes) {
    // Step 1: Create slider widget
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend', slider);

    // Step 1: Set slider attributes
    document.querySelector(".range-slider").max = attributes.length - 1;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    // Step 2: Create step buttons
    document.querySelector('#panel').insertAdjacentHTML('beforeend', '<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend', '<button class="step" id="forward">Forward</button>');

    // Step 5: Listen for user input via affordances
    document.querySelectorAll('.step').forEach(function(step) {
        step.addEventListener("click", function() {
            var index = Number(document.querySelector('.range-slider').value);

            // Step 6 & 7: Increment/decrement and wrap around
            if (step.id == 'forward') {
                index++;
                index = index > attributes.length - 1 ? 0 : index;
            } else if (step.id == 'reverse') {
                index--;
                index = index < 0 ? attributes.length - 1 : index;
            }

            // Step 8: Update slider position
            document.querySelector('.range-slider').value = index;

            // Step 9 & 10: Update symbols and popups
            updatePropSymbols(attributes[index]);
        });
    });

    document.querySelector('.range-slider').addEventListener('input', function() {
        var index = this.value;
        updatePropSymbols(attributes[index]);
    });
}

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', createMap);