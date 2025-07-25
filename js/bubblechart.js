window.onload = function() {
            var w = 900, h = 500;

            // --- Selections & Blocks ---
            var container = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .attr("class", "container")
                .style("background-color", "rgba(0,0,0,0.2)");

            var innerRect = container.append("rect")
                .datum(400)
                .attr("width", function(d) { return d * 2; })
                .attr("height", function(d) { return d; })
                .attr("class", "innerRect")
                .attr("x", 50)
                .attr("y", 50)
                .style("fill", "#FFFFFF");

            d3.csv("data/uscities1.csv").then(function(data) {
                // Convert population and density to numbers
                data.forEach(function(d) {
                    d.population = +d.population;
                    d.density = +d.density;
                    d.lat = +d.lat;
                    d.lng = +d.lng;
                });

                // Filter for top 5 cities by population
                data = data.sort((a, b) => b.population - a.population).slice(0, 5);

                // --- Scales ---
                var x = d3.scaleLinear()
                    .range([90, 790]) // Fits bubbles inside the innerRect (x: 50, width: 800)
                    .domain([0, data.length - 1]);

                var minPop = d3.min(data, d => d.population);
                var maxPop = d3.max(data, d => d.population);

                var y = d3.scaleLinear()
                    .range([450, 50]) // Matches innerRect y and height
                    .domain([minPop, maxPop]);

                var color = d3.scaleLinear()
                    .range(["#FDBE85", "#D94701"])
                    .domain([minPop, maxPop]);

                // --- Bubble Chart Circles ---
                var cityCircles = container.selectAll(".cityCircles")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("class", "cityCircles circles")
                    .attr("id", d => d.city)
                    .attr("r", d => Math.sqrt(d.population * 0.0012 / Math.PI)) // Slightly smaller for fit
                    .attr("cx", (d, i) => x(i))
                    .attr("cy", d => y(d.population))
                    .style("fill", d => color(d.population))
                    .style("stroke", "#000");

                // --- Axis ---
                var yAxis = d3.axisLeft(y)
                    .ticks(8)
                    .tickFormat(d3.format(".2s"));

                var axis = container.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(50, 0)") // Aligns with innerRect x
                    .call(yAxis);

                // --- Title ---
                var title = container.append("text")
                    .attr("class", "title")
                    .attr("text-anchor", "middle")
                    .attr("x", 450)
                    .attr("y", 40)
                    .text("Top 5 US City Populations");

                // --- Labels inside circles ---
                var format = d3.format(",");
                var labels = container.selectAll(".labels")
                    .data(data)
                    .enter()
                    .append("text")
                    .attr("class", "labels")
                    .attr("text-anchor", "middle")
                    .attr("x", (d, i) => x(i))
                    .attr("y", d => y(d.population))
                    .style("fill", "#222")
                    .style("font-size", "1em");

                labels.append("tspan")
                    .attr("x", (d, i) => x(i))
                    .attr("dy", "-0.5em")
                    .text(d => d.city);

                labels.append("tspan")
                    .attr("x", (d, i) => x(i))
                    .attr("dy", "1.2em")
                    .text(d => format(d.population));
            });
        };
