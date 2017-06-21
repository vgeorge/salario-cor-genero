import React from "react";
import styled, { withTheme } from "styled-components";
import { transparentize } from "polished";
import * as d3 from "d3";
import { withFauxDOM } from "react-faux-dom";
import Tooltip from "./Tooltip.js";

const Wrapper = styled.div`
  position: relative;
  display: inline-block;

  .data {
    opacity: ${({ hover }) => (hover && hover.d ? 0.25 : 1)};
  }

  ${({ hover }) =>
    hover &&
    hover.i >= 0 &&
    `.bar--x-${hover.i} {
    opacity: 1;
    -webkit-transition: opacity .2s ease-in;
  }`}

  .tooltip {

    visibility: ${({ hover }) => (hover ? "visible" : "hidden")};
    -webkit-transition: top .2s ease-out, left .2s ease-out;
  }
`;

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
    const self = this;
    const { hover } = this.state;
    return (
      <Wrapper className="relative-gap-chart" hover={hover}>
        {hover &&
          hover.d &&
          <Tooltip key="2" {...this.computeTooltipProps(hover)} />}
        {this.props.chart}
      </Wrapper>
    );
  }

  // MOUSE EVENTS

  setHover(d, i) {
    const hover = { d, i };
    this.setState({ hover });
    this.props.onChange(hover);
  }

  handleMouseoverEvent(d, i) {
    clearTimeout(this.unsetHoverTimeout);
    this.setHover(d, i);
  }

  handleMouseoutEvent(d) {
    this.unsetHoverTimeout = setTimeout(() => this.setHover(null), 200);
  }

  // TOOLTIP

  computeTooltipProps(hover) {
    var result = {
      style: {
        top: this.scales.y(Math.abs(hover.d.relativeGap)) - 100,
        left: this.scales.x(hover.i) + (hover.d.relativeGap > 0 ? -180 : +60)
      },
      d: hover.d,
      i: hover.i
    };

    return result;
  }

  renderD3() {
    var self = this;
    var data = this.props.data;

    var domain = this.props.domain;
    var margin = { top: 20, right: 20, bottom: 30, left: 50 };
    var width = window.innerWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    this.height = height;
    var points = {
      radius: {
        higher: 3,
        lower: 1
      },
      opacity: 0.3
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
    const axisXmargin = 30;
    const scales = {
      x: d3
        .scaleLinear()
        .range([axisXmargin, width - axisXmargin])
        .domain([0, data.series.length]),
      y: d3.scaleLinear().range([height, 0]).domain([0, data.relativeGapMax])
    };
    this.scales = scales;

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
      .attr("class", (d, i) => `data bar--x-${i}`)
      .style("fill", function(d) {
        return d.relativeGap > 0
          ? self.props.theme.menColor
          : self.props.theme.womenColor;
      })
      .attr("cx", function(d, i) {
        return scales.x(i);
      })
      .attr("cy", function(d) {
        return scales.y(Math.abs(d.relativeGap));
      })
      .attr("r", function(d) {
        return 2;
      })
      .on("mouseover", self.handleMouseoverEvent);
    // .on("mouseout", self.handleMouseoutEvent);

    enterG
      .append("path")
      .attr("class", (d, i) => `data bar--x-${i}`)
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
          scales.y(Math.abs(d.relativeGap))
        );
      })
      .on("mouseover", self.handleMouseoverEvent);
    // .on("mouseout", self.handleMouseoutEvent);

    // add y axis
    var axis = d3.axisRight(scales.y).ticks(3).tickSize(width);

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

    svg
      .append("g")
      .append("text")
      .style("fill", self.props.theme.menColor)
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", scales.x(data.series.length - 1))
      .attr("y", height + margin.right + 5)
      .text("Homens recebem mais →");

    svg
      .append("g")
      .append("text")
      .style("fill", self.props.theme.womenColor)
      .attr("class", "x label")
      .attr("text-anchor", "begin")
      .attr("x", scales.x(0))
      .attr("y", height + margin.right + 5)
      .text("← Mulheres recebem mais");

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
