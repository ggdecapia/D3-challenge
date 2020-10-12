// define screen width & height 
var svgWidth = 960;
var svgHeight = 500;

// define screen margins
var margin = 
{
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

// Initial/default Parameters
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on x-axis label
function xScale(censusData, chosenXAxis) 
{
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis])  * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
}

// function used for updating y-scale var upon click on y-axis label
function yScale(censusData, chosenYAxis) 
{
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenYAxis])  * 0.8,
        d3.max(censusData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
}

// function used for updating xAxis var upon click on x-axis label
function renderXAxes(newXScale, xAxis) 
{
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating xAxis var upon click on y-axis label
function renderYAxes(newYScale, yAxis) 
{
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis)
{

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}

// function used for updating circles group with new tooltip for the chosenXAxis/chosenYAxis
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) 
{
    // sets x-axis label values
    var xLabel;
      
    if (chosenXAxis === "poverty") 
    {
      xLabel = "Poverty Rate: ";
    }
    else if (chosenXAxis === "age") 
    {
      xLabel = "Age (Median): ";
    }
    else 
    {
      xLabel = "Household Income (Median): ";
    }
  
    // sets y-axis label values
    var yLabel;

    if (chosenYAxis === "obesity") 
    {
      yLabel = "Obesity: ";
    }
    else if (chosenYAxis === "smokes") 
    {
      yLabel = "Smokes: ";
    }
    else 
    {
      yLabel = "Healthcare: ";
    }

    // define toolTip attributes
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html( d => `${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`)
      /*.html(function(d) 
      {
        return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      })*/
      ;
  
    circlesGroup.call(toolTip);
  
    // onmouseover event-handling
    circlesGroup.on("mouseover", function(data) 
    {
      toolTip.show(data);
    })
      // onmouseout event-handling
      .on("mouseout", function(data, index) 
      {
        toolTip.hide(data);
      });
  
    return circlesGroup;
}

// load data from data.csv
d3.csv("/assets/data/data.csv").then(function(censusData, err) 
{
    if (err) throw err;
    console.log(censusData);

    // parse data
    censusData.forEach(function(data) 
    {
        // converts x-axis data into integers 
        data.poverty = +data.poverty; 
        data.age = +data.age; 
        data.income = +data.income;
        // converts y-axis data into integers 
        data.obesity = +data.obesity;
        data.smokes = +data.smokes; 
        data.healthcare = +data.healthcare;
    });
  
    // xLinearScale function 
    var xLinearScale = xScale(censusData, chosenXAxis);
  
    // yLinearScale function 
    var yLinearScale = yScale(censusData, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .attr("transform", `translate(0, 0)`)
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("class", "stateCircle")
      .attr("opacity", ".5");

    // create textLabelGroup to write Abbr texts into the circlesgroup
    var textLabel = chartGroup.selectAll(null)
      .data(censusData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]) + 5)
      .text( d => d.abbr )
      .attr("class", "stateText");                                   
                    
    // create function to render the abbr values upon transition to chosenXAxis/chosenYAxis
    function renderAbbr(textsAbbr, newXScale, newYScale, chosenXAxis, chosenYAxis)
    {
      textsAbbr.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]) + 5);
      
      return textsAbbr;
    }

    // Create group for x-axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width/2}, ${height + 20})`);
  
    var povertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("Poverty (%)");
  
    var ageLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
  
    // Create group for y-axis labels
    var yLabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")
      .attr("dy", "1em")
      .classed("axis-text", true);

    var obesityLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height / 2) - 10)                
      .attr("y", -80)
      .attr("value", "obesity")
      .classed("active", true)
      .text("Obesity (%)");            

    var smokesLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height / 2) - 10)
      .attr("y", -60)
      .attr("value", "smokes")
      .classed("inactive", true)
      .text("Smokes (%)");

    var healthcareLabel = yLabelsGroup.append("text")
      .attr("x", 0 - (height / 2) - 20)                
      .attr("y", -40)
      .attr("value", "healthcare")
      .classed("inactive", true)
      .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
    // x-axis labels event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(censusData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          textLabel = renderAbbr(textLabel, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
          textLabel = updateToolTip(chosenXAxis, chosenYAxis, textLabel);

          // changes classes to change bold text
          if (chosenXAxis === "poverty") 
          {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);

          }
          else if (chosenXAxis === "age") 
          {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);              
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else 
          {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);              
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);      
          }
        }
      });        

      // y-axis labels event listener
      yLabelsGroup.selectAll("text")
        .on("click", function() 
        {
            // get value of selection
             var value = d3.select(this).attr("value");
            //alert(value);
            if (value !== chosenYAxis) {

              // replaces chosenXAxis with value
              chosenYAxis = value;
      
              // functions here found above csv import
              // updates x scale for new data
              yLinearScale = yScale(censusData, chosenYAxis);
      
              // updates x axis with transition
              yAxis = renderYAxes(yLinearScale, yAxis);
      
              // updates circles with new x values
              circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                   
              textLabel = renderAbbr(textLabel, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
              textLabel = updateToolTip(chosenXAxis, chosenYAxis, textLabel);
    
              // changes classes to change bold text
              if (chosenYAxis === "obesity") 
              {
                obesityLabel
                  .classed("active", true)
                  .classed("inactive", false);
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
                healthcareLabel
                  .classed("active", false)
                  .classed("inactive", true);
    
              }
              else if (chosenYAxis === "smokes") 
              {
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
                smokesLabel
                  .classed("active", true)
                  .classed("inactive", false);              
                healthcareLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else 
              {
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);              
                healthcareLabel
                  .classed("active", true)
                  .classed("inactive", false);      
              }
            }                   
      });
  }).catch(function(error) 
  {
    console.log(error);
  });
