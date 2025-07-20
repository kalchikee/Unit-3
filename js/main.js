window.onload = setMap;

function setMap() {
    var promises = [
        d3.json("data/uscities1.geojson"),
        d3.json("data/states.json"),
        d3.csv("data/uscities1.csv") // <-- Add this line
    ];
    Promise.all(promises).then(function(data) {
        var geojsonData = data[0];
        var topoData = data[1];
        var csvData = data[2]; // <-- CSV data now available

        // You can now use csvData for joining attributes, choropleth, etc.
        console.log("Loaded CSV data:", csvData);

        if (!geojsonData || !geojsonData.features) {
            console.error("GeoJSON data missing or invalid.");
            return;
        }
        if (!topoData || !topoData.objects) {
            console.error("TopoJSON data missing or invalid.");
            return;
        }

        // Try to find the correct object name for states polygons
        let objectName = "states";
        if (!topoData.objects.states) {
            objectName = Object.keys(topoData.objects)[0];
            console.warn(`'states' object not found, using '${objectName}' instead.`);
        }

        var topoFeatures = topojson.feature(topoData, topoData.objects[objectName]);
        if (!topoFeatures || !topoFeatures.features) {
            console.error("No features found in TopoJSON object:", objectName);
            return;
        }

        var width = 960, height = 600;
        var svg = d3.select("#map").append("svg")
            .attr("width", width)
            .attr("height", height);

        // Optional: Add a background rectangle for contrast
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#f8f8f8");

        var projection = d3.geoAlbersUsa()
            .scale(1200)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath().projection(projection);

        // --- Add Graticule ---
        var graticule = d3.geoGraticule().step([5, 5]);

        // Graticule background (optional, symbolizes water)
        svg.append("path")
            .datum(graticule.outline())
            .attr("class", "gratBackground")
            .attr("d", path);

        // Graticule lines
        svg.selectAll(".gratLines")
            .data(graticule.lines())
            .enter()
            .append("path")
            .attr("class", "gratLines")
            .attr("d", path);
        // --- End Graticule ---

        // Draw polygons/lines from TopoJSON FIRST (background)
        svg.selectAll(".region")
            .data(topoFeatures.features)
            .enter()
            .append("path")
            .attr("class", "region")
            .attr("d", path)
            .attr("fill", "#e0e7ef")
            .attr("stroke", "#888")
            .attr("stroke-width", 1)
            .attr("opacity", 0.85);

        // Draw state boundaries from TopoJSON (if available)
        if (topoData.objects.states) {
            svg.append("path")
                .datum(topojson.mesh(topoData, topoData.objects.states, (a, b) => a !== b))
                .attr("class", "state-boundary")
                .attr("d", path)
                .attr("fill", "none")
                .attr("stroke", "#222")
                .attr("stroke-width", 2.5);
        }

        // Draw city points from GeoJSON SECOND (foreground)
        svg.selectAll("circle")
            .data(geojsonData.features.filter(d => {
                return d.geometry && d.geometry.coordinates &&
                    projection(d.geometry.coordinates) !== null;
            }))
            .enter()
            .append("circle")
            .attr("cx", d => {
                const coords = projection(d.geometry.coordinates);
                return coords ? coords[0] : 0;
            })
            .attr("cy", d => {
                const coords = projection(d.geometry.coordinates);
                return coords ? coords[1] : 0;
            })
            .attr("r", 5) // larger points for clarity
            .attr("fill", "#1976d2")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .attr("opacity", 0.9);
    }).catch(function(error) {
        console.error("Error loading data:", error);
    });
}