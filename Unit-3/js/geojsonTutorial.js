// Sample GeoJSON data
var samplePoint = {
    "type": "Feature",
    "properties": {
        "name": "New York City",
        "description": "The most populous city in the United States"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-74.006, 40.7128]
    }
};

var multipleFeatures = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Central Park",
                "type": "park"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-73.9584, 40.8006],
                    [-73.9482, 40.8006],
                    [-73.9482, 40.7681],
                    [-73.9584, 40.7681],
                    [-73.9584, 40.8006]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Brooklyn Bridge",
                "type": "bridge"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [-74.0059, 40.7061],
                    [-73.9969, 40.7033]
                ]
            }
        }
    ]
};

var interactiveFeatures = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Statue of Liberty",
                "description": "A symbol of freedom and democracy",
                "type": "monument"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-74.0445, 40.6892]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Times Square",
                "description": "The crossroads of the world",
                "type": "landmark"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-73.985, 40.758]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Empire State Building",
                "description": "Iconic Art Deco skyscraper",
                "type": "building"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-73.9857, 40.7484]
            }
        }
    ]
};

var pointFeatures = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Coffee Shop A",
                "category": "food"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-73.987, 40.750]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Restaurant B",
                "category": "food"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-73.980, 40.760]
            }
        }
    ]
};

var filteredFeatures = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Large Park",
                "size": "large"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-73.970, 40.770]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Small Park",
                "size": "small"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-73.980, 40.780]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Large Building",
                "size": "large"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-73.975, 40.775]
            }
        }
    ]
};

// 1. Basic GeoJSON Layer
var map1 = L.map('map1').setView([40.7128, -74.006], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map1);
L.geoJSON(samplePoint).addTo(map1);

// 2. Multiple Features with Custom Styling
var map2 = L.map('map2').setView([40.7589, -73.9851], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map2);

var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65,
    "fillColor": "#ff7800",
    "fillOpacity": 0.3
};

L.geoJSON(multipleFeatures, {style: myStyle}).addTo(map2);

// 3. Interactive Features with Popups
var map3 = L.map('map3').setView([40.7589, -73.9851], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map3);

function onEachFeature(feature, layer) {
    if (feature.properties) {
        var popupContent = "<strong>" + feature.properties.name + "</strong>";
        if (feature.properties.description) {
            popupContent += "<br>" + feature.properties.description;
        }
        layer.bindPopup(popupContent);
    }
}

L.geoJSON(interactiveFeatures, {
    onEachFeature: onEachFeature
}).addTo(map3);

// 4. Custom Markers using pointToLayer
var map4 = L.map('map4').setView([40.7589, -73.9851], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map4);

L.geoJSON(pointFeatures, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    }
}).addTo(map4);

// 5. Filtering Features
var map5 = L.map('map5').setView([40.7589, -73.9851], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map5);

// Show all features
L.geoJSON(filteredFeatures, {
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 6,
            fillColor: "#3498db",
            color: "#2c3e50",
            weight: 2,
            fillOpacity: 0.7
        });
    }
}).addTo(map5);

// Show only large features
L.geoJSON(filteredFeatures, {
    filter: function(feature) {
        return feature.properties.size === "large";
    },
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 8,
            fillColor: "#e74c3c",
            color: "#c0392b",
            weight: 2,
            fillOpacity: 0.7
        });
    }
});

// Show only small features
L.geoJSON(filteredFeatures, {
    filter: function(feature) {
        return feature.properties.size === "small";
    },
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 4,
            fillColor: "#2ecc71",
            color: "#27ae60",
            weight: 2,
            fillOpacity: 0.7
        });
    }
});

// Advanced example: Custom styling based on properties
function getColor(type) {
    return type === 'park' ? '#2ecc71' :
           type === 'bridge' ? '#3498db' :
           type === 'monument' ? '#9b59b6' :
           type === 'landmark' ? '#e74c3c' :
           type === 'building' ? '#f39c12' :
           '#95a5a6';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.type),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Example with hover effects
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    layer.bringToFront();
}

function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
}

function onEachFeatureAdvanced(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: function(e) {
            map.fitBounds(e.target.getBounds());
        }
    });
}

var geojsonLayer = L.geoJSON(multipleFeatures, {
    style: style,
    onEachFeature: onEachFeatureAdvanced
});

// Loading GeoJSON from external file (example)
/*
fetch('data.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));
*/