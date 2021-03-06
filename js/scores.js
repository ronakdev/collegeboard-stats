/*  This visualization was made possible by modifying code provided by:

Scott Murray, Choropleth example from "Interactive Data Visualization for the Web" 
https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html   
		
Malcolm Maclean, tooltips example tutorial
http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

Mike Bostock, Pie Chart Legend
http://bl.ocks.org/mbostock/3888852  */

var ranScoresBefore = false;

function generateScoresMap() {
    if (ranScoresBefore) {
        return;
    }
    else {
        ranScoresBefore = true;
    }
    //Width and height of map
    var width = 960;
    var height = 500;

    // D3 Projection
    var projection = d3.geo.albersUsa()
        .translate([width / 2, height / 2]) // translate to center of screen
        .scale([1000]); // scale things down so see entire US

    // Define path generator
    var path = d3.geo.path() // path generator that will convert GeoJSON to SVG paths
        .projection(projection); // tell path generator to use albersUsa projection
    let divTarget = "#scores-map"

    // Define linear scale for output
    var color = d3.scale.linear().
    range(["rgb(0,51,102)", "rgb(68, 138, 255)"]);

    var legendText = ["Below 3", "Above 3"];

    //Create SVG element and append map to the SVG
    var svg = d3.select(divTarget)
        .append("div")
        .attr("id", "svg")
        .append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMin");

    // Append Div for tooltip to SVG
    var div = d3.select(divTarget)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Load in my states data!
    //github pages bug, need to find better solution
    d3.csv("https://ronakshah.net/collegeboard-stats/csv/apscoresbystate.csv", function (data) {
        color.domain([0, 1]); // setting the range of the input data

        // Load GeoJSON data and merge with states data
        d3.json("https://ronakshah.net/collegeboard-stats/json/us-states.json", function (json) {

            // Loop through each state data value in the .csv file
            for (var i = 0; i < data.length; i++) {

                // Grab State Name
                var dataState = data[i].state;

                // Grab data value 
                var dataValue = data[i].percentage;

                // Find the corresponding state inside the GeoJSON
                for (var j = 0; j < json.features.length; j++) {
                    var jsonState = json.features[j].properties.name;

                    if (dataState == jsonState) {

                        // Copy the data value into the JSON
                        json.features[j].properties.percentage = dataValue;

                        // Stop looking through the JSON
                        break;
                    }
                }
            }

            // Bind the data to the SVG and create one path per GeoJSON feature
            svg.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("stroke", "#fff")
                .style("stroke-width", "1")
                .style("fill", function (d) {

                    // Get data value
                    var value = d.properties.percentage;

                    if (value) {
                        //If value exists…
                        value = parseFloat(value.replace("%", ""));
                        console.log(value);
                        if (value < 50) {
                            return "rgb(0,51,102)";
                        } else {
                            return "rgb(68, 138, 255)";
                        }
                    } else {
                        //If value is undefined…
                        return "rgb(213,222,217)";
                    }

                })
                .on("mouseover", function (d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.text(d.properties.percentage)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })

                // fade out tooltip on mouse out               
                .on("mouseout", function (d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            /*
            // Map the cities I have lived in!
            d3.csv("../csv/cities-lived.csv", function(data) {

            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    return projection([d.lon, d.lat])[0];
                })
                .attr("cy", function(d) {
                    return projection([d.lon, d.lat])[1];
                })
                .attr("r", function(d) {
                    return Math.sqrt(d.years) * 4;
                })
                    .style("fill", "rgb(217,91,67)")	
                    .style("opacity", 0.85)	

                // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
                // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
                .on("mouseover", function(d) {      
                    div.transition()        
                       .duration(200)      
                       .style("opacity", .9);      
                       div.text(d.place)
                       .style("left", (d3.event.pageX) + "px")     
                       .style("top", (d3.event.pageY - 28) + "px");    
                })   

                // fade out tooltip on mouse out               
                .on("mouseout", function(d) {       
                    div.transition()        
                       .duration(500)      
                       .style("opacity", 0);   
                });
            });  
            */
            // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
            var legend = d3.select(divTarget).append("svg")
                .attr("class", "legend")
                .attr("width", 140)
                .attr("height", 200)
                .selectAll("g")
                .data(color.domain().slice())
                .enter()
                .append("g")
                .attr("transform", function (d, i) {
                    return "translate(10," + i * 25 + ")";
                });

            legend.append("rect")
                .attr("width", 28)
                .attr("height", 28)
                .style("fill", color);

            legend.append("text")
                .data(legendText)
                .attr("class", "legend-text")
                .attr("x", 40)
                .attr("y", 9)
                .attr("dy", ".65em")
                .text(function (d) {
                    return d;
                });
        });

    });
}
