// Load data and create the chart
d3.csv("data.csv").then(function(data) {
    // Parse the data if necessary
    data.forEach(function(d) {
        d.year = +d.year;
        // Parse other relevant fields if needed
        d.greenhouse_gas_emissions = +d.greenhouse_gas_emissions;
    });

    // Extract unique countries
    const countries = [...new Set(data.map(d => d.country))];

    // Create a dropdown menu for selecting countries
    const select = d3.select("#country-select");
    select.append("option").text("Select a country");
    countries.forEach(country => {
        select.append("option").text(country).attr("value", country);
    });

    // Set up dimensions for the chart
    const margin = {top: 100, right: 50, bottom: 70, left: 60}; // Adjust the margins as needed
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select(".chart")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(90)")
        .attr("x", +200)
        .attr("y", +margin.left-10)
        .text("Greenhouse Gas Emissions");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", height + margin.bottom/2)
        .text("Year");

    // Create scales
    const xScale = d3.scaleLinear()
                    .domain(d3.extent(data, d => d.year))
                    .range([0, width]);

    const yScale = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.greenhouse_gas_emissions)])
                    .nice()
                    .range([height, 0]);

    // Add X axis
    const xAxis = svg.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    // Add Y axis
    const yAxis = svg.append("g")
                    .attr("class", "y-axis")
                    .call(d3.axisLeft(yScale));

    // Tooltip
    const tooltip = d3.select(".tooltip");

    // Update chart based on selected country
    select.on("change", function() {
        const selectedCountry = this.value;
        const filteredData = data.filter(d => d.country === selectedCountry);
        const filteredNonZeroData = filteredData.filter(d => d.greenhouse_gas_emissions !== 0);

        const xExtent = d3.extent(filteredNonZeroData, d => d.year);
        const yExtent = d3.extent(filteredNonZeroData, d => d.greenhouse_gas_emissions);

        xScale.domain(xExtent).nice();
        yScale.domain(yExtent).nice();

        // Remove existing dots
        svg.selectAll(".dot").remove();

        // Add circles for data points
        svg.selectAll(".dot")
            .data(filteredNonZeroData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.year))
            .attr("cy", d => yScale(d.greenhouse_gas_emissions))
            .attr("r", 5)
            .style("fill", "steelblue")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("Year: " + d.year + "<br/>" + "Greenhouse Gas Emissions: " + d.greenhouse_gas_emissions)
                    .style("left", (event.pageX-500) + "px")
                    .style("top", (event.pageY -100) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0.9);
            });

        // Update X axis
        xAxis.transition().duration(1000).call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

        // Update Y axis
        yAxis.transition().duration(1000).call(d3.axisLeft(yScale));
    });

    // Zooming functionality
    svg.call(d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", function(event) {
            const new_xScale = event.transform.rescaleX(xScale);
            const new_yScale = event.transform.rescaleY(yScale);
            xAxis.call(d3.axisBottom(new_xScale).tickFormat(d3.format("d")));
            yAxis.call(d3.axisLeft(new_yScale));
            svg.selectAll(".dot")
                .attr("cx", d => new_xScale(d.year))
                .attr("cy", d => new_yScale(d.greenhouse_gas_emissions));
        })
    );
});