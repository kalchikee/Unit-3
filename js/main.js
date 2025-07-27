/*
 * ===== TOPOJSON INTRODUCTION =====
 * 
 * TopoJSON is the first geospatial data format for the Web that encodes topology.
 * Topology describes the digital encoding of spatial relationships of connected/unconnected, 
 * adjacent/detached, inside/outside, etc.
 * 
 * Advantages of topological data formats:
 * 1. Data integrity maintained when features are edited
 * 2. Spatial analysis using relationships between features is easier
 * 3. File size significantly reduced by eliminating overlapping vertices
 */

(function() {
    'use strict';

    // ===== GLOBAL VARIABLES =====
    var attrArray = ["population", "density", "lat", "lng"];
    var expressed = attrArray[0]; // Initial attribute

    // ===== INITIALIZATION =====
    window.onload = setMap;

    function setMap() {
        // Load all data files
        var promises = [
            d3.json("data/uscities1.geojson"),
            d3.json("data/states.json"),
            d3.csv("data/uscities1.csv")
        ];

        Promise.all(promises).then(function(data) {
            var geojsonData = data[0];
            var topoData = data[1];
            var csvData = data[2];

            console.log("Data loaded successfully");
            console.log("CSV sample:", csvData[0]);
            console.log("GeoJSON sample:", geojsonData.features[0].properties);

            // Validate data
            if (!validateData(geojsonData, topoData, csvData)) return;

            // Process TopoJSON
            var topoFeatures = processTopoJSON(topoData);
            if (!topoFeatures) return;

            // Create map
            var mapElements = createMapSVG();
            var svg = mapElements.svg;
            var projection = mapElements.projection;
            var path = mapElements.path;

            // Add map elements
            setGraticule(svg, path);
            drawStateBackground(svg, topoFeatures, path);

            // Process data
            geojsonData = joinData(geojsonData, csvData);
            var colorScale = makeColorScale(csvData);

            // Draw visualizations
            setEnumerationUnits(geojsonData, svg, path, colorScale, projection);
            setChart(csvData, colorScale);

        }).catch(function(error) {
            console.error("Error loading data:", error);
        });
    }

    // ===== DATA VALIDATION =====
    function validateData(geojsonData, topoData, csvData) {
        if (!geojsonData || !geojsonData.features) {
            console.error("GeoJSON data missing or invalid");
            return false;
        }
        if (!topoData || !topoData.objects) {
            console.error("TopoJSON data missing or invalid");
            return false;
        }
        if (!csvData || csvData.length === 0) {
            console.error("CSV data missing or invalid");
            return false;
        }
        return true;
    }

    // ===== TOPOJSON PROCESSING =====
    function processTopoJSON(topoData) {
        var objectName = "states";
        if (!topoData.objects.states) {
            objectName = Object.keys(topoData.objects)[0];
            console.warn(`'states' object not found, using '${objectName}'`);
        }

        var topoFeatures = topojson.feature(topoData, topoData.objects[objectName]);
        if (!topoFeatures || !topoFeatures.features) {
            console.error("No features found in TopoJSON object:", objectName);
            return null;
        }
        return topoFeatures;
    }

    // ===== MAP CREATION =====
    function createMapSVG() {
        var width = window.innerWidth * 0.6;
        var height = 500;

        var svg = d3.select("#map")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "map");

        var projection = d3.geoAlbersUsa()
            .scale(800)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath().projection(projection);

        return { svg: svg, projection: projection, path: path };
    }

    // ===== GRATICULE =====
    function setGraticule(svg, path) {
        var graticule = d3.geoGraticule().step([5, 5]);

        svg.append("path")
            .datum(graticule.outline())
            .attr("class", "gratBackground")
            .attr("d", path);

        svg.selectAll(".gratLines")
            .data(graticule.lines())
            .enter()
            .append("path")
            .attr("class", "gratLines")
            .attr("d", path);
    }

    // ===== BACKGROUND STATES =====
    function drawStateBackground(svg, topoFeatures, path) {
        svg.selectAll(".region")
            .data(topoFeatures.features)
            .enter()
            .append("path")
            .attr("class", "region")
            .attr("d", path);
    }

    // ===== DATA JOIN =====
    function joinData(geojsonData, csvData) {
        for (var i = 0; i < csvData.length; i++) {
            var csvCity = csvData[i];
            var csvKey = csvCity.city;

            for (var a = 0; a < geojsonData.features.length; a++) {
                var geojsonProps = geojsonData.features[a].properties;
                var geojsonKey = geojsonProps.city || geojsonProps.City || 
                               geojsonProps.NAME || geojsonProps.name;

                if (geojsonKey == csvKey) {
                    attrArray.forEach(function(attr) {
                        var val = parseFloat(csvCity[attr]);
                        geojsonProps[attr] = val;
                    });
                    break;
                }
            }
        }
        return geojsonData;
    }

    // ===== COLOR SCALE =====
    function makeColorScale(csvData) {
        var colorClasses = [
            "#D4B9DA", // Lowest
            "#C994C7", // Low
            "#DF65B0", // Medium
            "#DD1C77", // High
            "#980043"  // Highest
        ];

        var colorScale = d3.scaleQuantile().range(colorClasses);

        var domainArray = [];
        for (var i = 0; i < csvData.length; i++) {
            var val = parseFloat(csvData[i][expressed]);
            if (!isNaN(val)) {
                domainArray.push(val);
            }
        }

        colorScale.domain(domainArray);
        return colorScale;
    }

    // ===== MAP ENUMERATION UNITS =====
    function setEnumerationUnits(geojsonData, svg, path, colorScale, projection) {
        svg.selectAll("circle")
            .data(geojsonData.features.filter(d => {
                return d.geometry && d.geometry.coordinates &&
                       projection(d.geometry.coordinates) !== null;
            }))
            .enter()
            .append("circle")
            .attr("class", function(d) {
                return "cities " + (d.properties.city || d.properties.City || "unknown");
            })
            .attr("cx", d => {
                const coords = projection(d.geometry.coordinates);
                return coords ? coords[0] : 0;
            })
            .attr("cy", d => {
                const coords = projection(d.geometry.coordinates);
                return coords ? coords[1] : 0;
            })
            .attr("r", 6)
            .style("fill", function(d) {
                var value = d.properties[expressed];
                if (value && !isNaN(value)) {
                    return colorScale(value);
                } else {
                    return "#ccc";
                }
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.9);
    }

    // ===== COORDINATED BAR CHART =====
    function setChart(csvData, colorScale) {
        // Chart dimensions - increased width and bottom padding
        var chartWidth = window.innerWidth * 0.8; // Increased from 0.8 to 0.9
        var chartHeight = 500; // Increased from 460 to 500
        var leftPadding = 80;
        var rightPadding = 20;
        var topBottomPadding = 80; // Increased from 60 to 80
        var chartInnerWidth = chartWidth - leftPadding - rightPadding;
        var chartInnerHeight = chartHeight - topBottomPadding * 2;
        var translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

        // Process data for top 5 cities per classification
        var filteredData = getTopCitiesPerClassification(csvData, colorScale);

        // Create chart SVG
        var chart = d3.select("#chart-container")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");

        // Chart background
        chart.append("rect")
            .attr("class", "chartBackground")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        // Scales
        var yScale = d3.scaleLinear()
            .range([chartInnerHeight, 0])
            .domain([0, d3.max(filteredData, d => parseFloat(d[expressed]))]);

        // Bars
        createBars(chart, filteredData, chartInnerWidth, chartInnerHeight, 
                  leftPadding, topBottomPadding, yScale, colorScale);

        // Labels
        createLabels(chart, filteredData, chartInnerWidth, chartInnerHeight,
                    leftPadding, topBottomPadding, yScale);

        // Axes
        createAxes(chart, yScale, translate, chartWidth, chartHeight);

        // Titles
        createTitles(chart, chartWidth);
    }

    // ===== HELPER FUNCTIONS FOR CHART =====
    function getTopCitiesPerClassification(csvData, colorScale) {
        var sortedData = csvData.slice().sort((a, b) => 
            parseFloat(b[expressed]) - parseFloat(a[expressed]));

        var classifications = {
            "#980043": [], "#DD1C77": [], "#DF65B0": [], "#C994C7": [], "#D4B9DA": []
        };

        sortedData.forEach(function(d) {
            var value = parseFloat(d[expressed]);
            var color = colorScale(value);
            if (classifications[color]) {
                classifications[color].push(d);
            }
        });

        var filteredData = [];
        Object.keys(classifications).forEach(function(color) {
            filteredData = filteredData.concat(classifications[color].slice(0, 5));
        });

        return filteredData.sort((a, b) => parseFloat(a[expressed]) - parseFloat(b[expressed]));
    }

    function createBars(chart, data, innerWidth, innerHeight, leftPadding, topPadding, yScale, colorScale) {
        chart.selectAll(".bars")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", d => "bars " + d.city.replace(/\s+/g, '_'))
            .attr("width", innerWidth / data.length - 2)
            .attr("x", (d, i) => i * (innerWidth / data.length) + leftPadding)
            .attr("height", d => innerHeight - yScale(parseFloat(d[expressed])))
            .attr("y", d => yScale(parseFloat(d[expressed])) + topPadding)
            .style("fill", d => {
                var value = parseFloat(d[expressed]);
                return !isNaN(value) ? colorScale(value) : "#ccc";
            })
            .style("stroke", "#fff")
            .style("stroke-width", "1px");
    }

    function createLabels(chart, data, innerWidth, innerHeight, leftPadding, topPadding, yScale) {
        // Value labels
        chart.selectAll(".numbers")
            .data(data)
            .enter()
            .append("text")
            .attr("class", d => "numbers " + d.city.replace(/\s+/g, '_'))
            .attr("text-anchor", "middle")
            .attr("x", (d, i) => {
                var fraction = innerWidth / data.length;
                return i * fraction + (fraction - 1) / 2 + leftPadding;
            })
            .attr("y", d => yScale(parseFloat(d[expressed])) + topPadding - 5)
            .style("font-size", "10px")
            .style("fill", "#333")
            .style("font-family", "Arial, sans-serif")
            .text(d => {
                var value = parseFloat(d[expressed]);
                if (value >= 1000000) {
                    return (value / 1000000).toFixed(1) + "M";
                } else if (value >= 1000) {
                    return Math.round(value / 1000) + "K";
                } else {
                    return value;
                }
            });

        // City name labels on X-axis - moved up
        chart.selectAll(".city-labels")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "city-labels")
            .attr("text-anchor", "end")
            .attr("x", (d, i) => {
                var fraction = innerWidth / data.length;
                return i * fraction + (fraction - 1) / 2 + leftPadding;
            })
            .attr("y", innerHeight + topPadding + 20) // Moved up from +35 to +20
            .style("font-size", "9px")
            .style("fill", "#333")
            .style("font-family", "Arial, sans-serif")
            .attr("transform", (d, i) => {
                var fraction = innerWidth / data.length;
                var x = i * fraction + (fraction - 1) / 2 + leftPadding;
                return "rotate(-45," + x + "," + (innerHeight + topPadding + 20) + ")";
            })
            .text(d => d.city);
    }

    function createAxes(chart, yScale, translate, chartWidth, chartHeight) {
        // Y-axis
        var yAxis = d3.axisLeft()
            .scale(yScale)
            .tickFormat(d => {
                if (d >= 1000000) {
                    return (d / 1000000) + "M";
                } else if (d >= 1000) {
                    return (d / 1000) + "K";
                } else {
                    return d;
                }
            });

        chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(yAxis);

        // Y-axis label
        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 15)
            .attr("x", 0 - (chartHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-family", "Arial, sans-serif")
            .style("font-size", "12px")
            .style("fill", "#333")
            .text("Population");
    }

    function createTitles(chart, chartWidth) {
        // Chart title - increased font size
        chart.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", 20)
            .attr("class", "chartTitle")
            .attr("text-anchor", "middle")
            .style("font-family", "Arial, sans-serif")
            .style("font-size", "18px") // Increased from 14px to 18px
            .style("font-weight", "bold")
            .style("fill", "#333")
            .text("Top 5 Cities from Each Population Classification");

        // Subtitle - increased font size
        chart.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", 45) // Moved down slightly to accommodate larger title
            .attr("text-anchor", "middle")
            .style("font-family", "Arial, sans-serif")
            .style("font-size", "13px") // Increased from 10px to 13px
            .style("fill", "#666")
            .text("Showing the 5 largest cities from each of the 5 population classifications");
    }

})(); //last line of main.js