// define screen width & height 
var svgWidth = 960;
var svgHeight = 500;

// define screen margins
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// define actual screen width & height minus the margins
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis])  * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var label;
  
    if (chosenXAxis === "poverty") {
      label = "Poverty Rate:";
    }
    else {
      label = "Household Income:";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
}

d3.csv("/assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;
    console.log(censusData);
    // parse data
    censusData.forEach(function(data) {
        data.poverty = +data.poverty; // converts into integers
        data.healthcare = +data.healthcare; // converts into integers
        data.income = +data.income; // converts into integers
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(censusData, d => d.healthcare)])
      .range([height, 0]);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    chartGroup.append("g")
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
                                 .data(censusData)
                                 .enter()
                                 .append("circle")
                                 .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                 .attr("cy", d => yLinearScale(d.healthcare))
                                 .attr("r", 20)
                                 .attr("class", "stateCircle")
                                 .attr("opacity", ".5");

    var text = chartGroup.selectAll("text")
                          .data(censusData)
                          .enter()
                          .append("text");

    var textLabels = text.attr("x", d => xLinearScale(d[chosenXAxis]))
                         .attr("y", (d => yLinearScale(d.healthcare) + 5))
                         .text( d => d.abbr )
                         .attr("font-family", "sans-serif")
                         .attr("font-size", "20px")
                         .attr("fill", "white")
                         .attr("text-anchor", "middle");

    // Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("Poverty (%)");
  
    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
  
    // append y axis
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Lacks Healthcare (%)");
  
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(censusData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  }).catch(function(error) {
    console.log(error);
  });
  












/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Load data from data.csv
d3.csv("/assets/data/data.csv").then(function(censusData) {

    console.log(censusData);
  
    // log a list of names
    var IDs = censusData.map(data => data.id);
    console.log("IDs: ", IDs);
    var states = censusData.map(data => data.state);
    console.log("states: ", states);
    var abbr = censusData.map(data => data.abbr);
    console.log("abbr: ", abbr);

    // Cast each numeric values as a number using the unary + operator
    censusData.forEach(function(data) {
      data.poverty = +data.poverty; // converts into integers
      data.healthcare = +data.healthcare; // converts into integers
    });

    var povertyRates = censusData.map(data => data.poverty);
    console.log("povertyRates: ", povertyRates);
    var healthcareRates = censusData.map(data => data.healthcare);
    console.log("healthcareRates: ", healthcareRates);

  }).catch(function(error) {
    console.log(error);
});
  
  