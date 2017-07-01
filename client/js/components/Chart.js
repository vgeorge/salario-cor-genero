import React from "react";
import styled, { withTheme } from "styled-components";
import { transparentize } from "polished";
import * as d3 from "d3";
import d3Fisheye from "../helpers/d3-fisheye.js";
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

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    this.chartProperties = {
      margin: margin,
      width: window.innerWidth - margin.left - margin.right,
      height: 500 - margin.top - margin.bottom,
      xBuffer: 50,
      circleRadius: 2,
      fisheye: d3Fisheye.circular().radius(50).distortion(2)
    };

    // Bindings
    this.renderD3 = this.renderD3.bind(this);
    this.updateD3 = this.updateD3.bind(this);
    this.handleMouseoverEvent = this.handleMouseoverEvent.bind(this);
    this.handleMouseoutEvent = this.handleMouseoutEvent.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.loaded) {
      this.loaded = true;
      this.renderD3();
    }
  }

  render() {
    const self = this;
    var hover = this.state && this.state.hover;

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

  updateD3() {
    const { fisheye } = this.chartProperties;

    // reattach to faux dom
    var faux = this.props.connectFauxDOM("div", "chart");
    var svgDoc = d3.select(faux).select("svg");
    var circles = svgDoc.select("g").selectAll("circle");

    // update all circles to new positions
    circles
      .each(function(d) {
        d.fisheye = fisheye(d);
      })
      .attr("cx", function(d) {
        return d.fisheye.x;
      })
      .attr("cy", function(d) {
        return d.fisheye.y;
      })
      .transition()
      .duration(500);

    this.props.animateFauxDOM(100);
  }

  renderD3() {
    var self = this;
    var { data, domain } = this.props;

    // Chart rendering parameters
    const {
      margin,
      width,
      height,
      xBuffer,
      circleRadius,
      fisheye
    } = self.chartProperties;

    this.height = height;

    // faux dom
    var faux = this.props.connectFauxDOM("div", "chart");

    // create svg
    var svg = d3
      .select(faux)
      .on("mousemove", function(param1, param2, param3) {
        var element = param3[0].component.childNodes[0];
        var position = d3.mouse(element);

        position[0] -= margin.left + xBuffer;
        position[1] = height - position[1] + margin.bottom - 5;

        fisheye.focus(position);

        self.updateD3();
      })
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // return empty node if data is not defined yet
    if (!data.series) return;

    // Define scales

    const scales = {
      x: d3
        .scaleLinear()
        .range([xBuffer, width - xBuffer])
        .domain([0, data.series.length]),
      y: d3.scaleLinear().range([height, 0]).domain([0, data.relativeGapMax])
    };
    this.scales = scales;

    // define d.x and d.y
    data.series.map(function(d, i) {
      d.x = scales.x(i);
      d.y = scales.y(Math.abs(d.relativeGap));
      return d;
    });

    // append data and svg elements
    var binding = svg.selectAll("g").data(data.series);
    var enterG = binding.enter().append("g");

    // circles
    enterG
      .append("circle")
      .attr("class", (d, i) => `data bar--x-${i}`)
      .style("fill", function(d) {
        return d.relativeGap > 0
          ? self.props.theme.menColor
          : self.props.theme.womenColor;
      })
      .attr("cx", function(d) {
        return d.x;
      })
      .attr("cy", function(d) {
        return d.y;
      })
      .attr("r", function(d) {
        return circleRadius;
      });
    // .on("mouseover", self.handleMouseoverEvent);
    // .on("mouseout", self.handleMouseoutEv2ent);

    enterG
      .append("path")
      .attr("class", (d, i) => `data bar--x-${i}`)
      .style("stroke-width", 3)
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
      });
    // .on("mouseover", self.handleMouseoverEvent);
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
  chart: "loading",
  loaded: false
};

const FauxChart = withFauxDOM(Chart);

export default withTheme(FauxChart);
