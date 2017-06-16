import React from "react";
import * as d3 from "d3";
import { withFauxDOM } from "react-faux-dom";
import { withTheme } from "styled-components";

class Chart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.props;

    // bind methods
    this.renderD3 = this.renderD3.bind(this);
    this.render = this.render.bind(this);
    this.handleMouseoverEvent = this.handleMouseoverEvent.bind(this);
    this.handleMouseoutEvent = this.handleMouseoutEvent.bind(this);
  }

  componentDidUpdate() {
    this.renderD3();
  }

  render() {
    return (
      <section className={this.props.className}>
        <p>
          {this.state.hover &&
            this.computeTooltipProps(this.state.hover).content}
        </p>
        {this.props.chart}
      </section>
    );
  }

  // MOUSE EVENTS

  setHover(d) {
    this.setState({
      hover: d
    });
  }

  handleMouseoverEvent(d) {
    clearTimeout(this.unsetHoverTimeout);
    this.setHover(d);
  }

  handleMouseoutEvent(d) {
    this.unsetHoverTimeout = setTimeout(() => this.setHover(null), 200);
  }

  // TOOLTIP

  computeTooltipProps(d) {
    return {
      content: d.profession
    };
  }

  renderD3() {
    var self = this;
    var data = this.props.data;

    var domain = this.props.domain;
    var margin = { top: 20, right: 20, bottom: 30, left: 100 };
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var points = {
      radius: {
        higher: 3,
        lower: 1
      },
      opacity: 0.5
    };

    var faux = this.props.connectFauxDOM("div", "chart");

    // apply margins
    var svg = d3
      .select(faux)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // return empty node if data is not defined yet
    if (!data.series) return;

    // Define scales
    var scales = {
      x: d3
        .scaleBand()
        .rangeRound([0, width])
        .padding(0.1)
        .domain(data.series.map((d, i) => i)),
      y: d3
        .scaleLinear()
        .range([height, 0])
        .domain([data.relativeGapMin, data.relativeGapMax])
    };

    // sort data
    data.series.sort(function(a, b) {
      return d3.ascending(a.relativeGap, b.relativeGap);
    });

    // append data and svg elements
    var binding = svg.selectAll("g").data(data.series);
    var enterG = binding.enter().append("g");

    // woman points
    enterG
      .append("circle")
      // .style("opacity", points.opacity)
      // .attr("class", "data point-women")
      .style("fill", function(d) {
        return d.relativeGap > 0
          ? self.props.theme.menColor
          : self.props.theme.womenColor;
      })
      .attr("cx", function(d, i) {
        return scales.x(i);
      })
      .attr("cy", function(d) {
        return scales.y(d.relativeGap);
      })
      .attr("r", function(d) {
        return 2;
      });
    // .on("mouseover", self.handleMouseoverEvent)
    // .on("mouseout", self.handleMouseoutEvent);

    enterG
      .append("path")
      .style("stroke", function(d) {
        return d.relativeGap > 0
          ? self.props.theme.menColor
          : self.props.theme.womenColor;
      })
      .attr("d", function(d, i) {
        return (
          "M " +
          scales.x(i) +
          " " +
          scales.y(0) +
          " L " +
          scales.x(i) +
          " " +
          scales.y(d.relativeGap)
        );
      });

    // add y axis
    var axis = d3.axisRight(scales.y).ticks(5).tickSize(width);

    // formart axis' ticks
    svg.append("g").call(axis).call(function(g) {
      g.selectAll("text").remove();
      g.select(".domain").remove();
      g
        .selectAll(".tick line")
        .attr("stroke", "#777")
        .attr("stroke-dasharray", "2,2");
    });

    // format axis labels
    var axisLabel = d3.axisLeft(scales.y).ticks(5, "%");

    // remove unwanted tick lines and domain
    svg.append("g").call(axisLabel).call(function(g) {
      g.selectAll(".tick line").remove();
      g.select(".domain").remove();
    });
  }
}

Chart.defaultProps = {
  chart: "loading"
};

const FauxChart = withFauxDOM(Chart);

export default withTheme(FauxChart);
