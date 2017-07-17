import { debounce } from "lodash";
import React from "react";
import styled from "styled-components";

/* D3.js */
import * as d3 from "d3";
import d3Fisheye from "../helpers/d3-fisheye.js";

/* Components */
import Infobox from "./Infobox";
import { withFauxDOM } from "react-faux-dom";

/* Chart config */
import config from "../config";

const Wrapper = styled.div`
  position: relative;
  display: inline-block;

  .data {
    pointer-events: none;
  }

  .tick {
    pointer-events: none;
  }
`;

class Chart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    // Bindings
    this.renderD3 = this.renderD3.bind(this);
    this.updatePositions = this.updatePositions.bind(this);
    this.positionLine = this.positionLine.bind(this);
    this.resetChart = this.resetChart.bind(this);
  }

  componentDidMount() {
    this.renderD3();
  }

  componentDidUpdate(prevProps) {
    const { selectedProfession, mouseX, frozen } = this.props;

    if (mouseX !== prevProps.mouseX && !frozen) {
      // Mouse movements

      if (mouseX == null) {
        this.xScale = this.xLinearScale;
      } else {
        this.xScale = this.xFisheyeScale.distortion(10).focus(mouseX);
      }

      this.updatePositions();
    } else if (selectedProfession !== prevProps.selectedProfession) {
      this.updatePositions();
    } else if (this.props.dimensions !== prevProps.dimensions) {
      const {
        containerWidth,
        containerHeight,
        headHeight
      } = this.props.dimensions;

      const { margin, xBuffer } = config.chart;

      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - headHeight - 2 * margin.top;
      const chartHeight = height - margin.top - margin.bottom;

      var faux = this.props.connectFauxDOM("div", "chart");
      var svg = d3.select(faux).select("svg");

      svg.attr("height", height);
      svg.attr("width", containerWidth);

      this.xLinearScale.range([xBuffer, width - xBuffer]);
      this.xFisheyeScale.range([xBuffer, width - xBuffer]);

      this.yScale.range([chartHeight, 0]);

      this.axis.tickSize(width);

      svg.select(".y.axis").call(this.axis).call(function(g) {
        g.selectAll("text").remove();
        g.select(".domain").remove();
        g
          .selectAll(".tick line")
          .attr("stroke", "#ccc")
          .attr("stroke-dasharray", "2,2");
      });

      svg.select(".y.axis-label").call(this.axisLabel).call(function(g) {
        g.selectAll(".tick line").remove();
        g.select(".domain").remove();
      });

      svg.select("g").selectAll(".lines line").call(this.positionLine);
      svg
        .select(".label.men")
        .attr("x", this.xLinearScale(this.props.data.series.length - 1))
        .attr("y", chartHeight + margin.right + 5);
      svg
        .select(".label.women")
        .attr("x", this.xLinearScale(0))
        .attr("y", chartHeight + margin.right + 5);

      this.props.animateFauxDOM(800);
    }
  }

  render() {
    var { data, selectedProfession } = this.props;

    return (
      <Wrapper className="relative-gap-chart">
        {selectedProfession != null &&
          <Infobox data={data} selectedProfession={selectedProfession} />}
        {this.props.chart}

      </Wrapper>
    );
  }

  positionLine(line) {
    const { xScale, yScale } = this;
    const { selectedProfession } = this.props;

    line
      .style("stroke-width", function(d, i) {
        if (selectedProfession == null) return 2;
        else if (selectedProfession == i) return 5;
        else return 1;
      })
      .style("opacity", function(d, i) {
        if (selectedProfession == null || selectedProfession == i) return 1;
        else return 0.5;
      })
      .attr("x1", function(d, i) {
        return xScale(i);
      })
      .attr("y1", function(d, i) {
        return yScale(0);
      })
      .attr("x2", function(d, i) {
        return xScale(i);
      })
      .attr("y2", function(d, i) {
        return yScale(Math.abs(d.relativeGap));
      });
  }

  renderD3() {
    var self = this;

    const { colors } = config;
    const { margin, xBuffer } = config.chart;
    const { data, _onChangeMouseX } = this.props;

    self._debouncedOnChangeMouseX = debounce(
      _onChangeMouseX,
      config.debounceTime
    );

    const {
      containerWidth,
      containerHeight,
      svgWidth,
      headHeight
    } = this.props.dimensions;

    const width = containerWidth - margin.left - margin.right;
    const svgHeight = containerHeight - headHeight;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    // Connect to faux dom
    var faux = this.props.connectFauxDOM("div", "chart");

    // Create svg and set origin
    var svg = d3
      .select(faux)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add a background rect for mousemove.
    svg
      .append("rect")
      .attr("class", "background")
      .attr("fill", "#fff")
      .attr("width", width)
      .attr("height", chartHeight);

    // Create fisheye scale
    this.xFisheyeScale = d3Fisheye
      .scale(d3.scale.linear)
      .domain([0, data.series.length])
      .range([xBuffer, width - xBuffer]);

    // Create linear scale
    var xScale = (this.xScale = this.xLinearScale = d3.scale
      .linear()
      .domain([0, data.series.length])
      .range([xBuffer, width - xBuffer]));

    var yScale = (this.yScale = d3.scale
      .linear()
      .domain([0, data.relativeGapMax * 1.5])
      .range([chartHeight, 0]));

    // add y axis
    var axis = d3.svg
      .axis()
      .orient("right")
      .scale(yScale)
      .ticks(5)
      .tickSize(width);

    this.axis = axis;

    // formart axis' ticks
    svg.append("g").attr("class", "y axis").call(axis).call(function(g) {
      g.selectAll("text").remove();
      g.select(".domain").remove();
      g
        .selectAll(".tick line")
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "2,2");
    });

    // format axis labels
    var axisLabel = d3.svg.axis().orient("left").scale(yScale).ticks(5, "%");

    this.axisLabel = axisLabel;

    // remove unwanted tick lines and domain
    svg
      .append("g")
      .attr("class", "y axis-label")
      .call(axisLabel)
      .call(function(g) {
        g.selectAll(".tick line").remove();
        g.select(".domain").remove();
      });

    svg
      .append("g")
      .append("text")
      .style("fill", colors.men)
      .attr("class", "x label men")
      .attr("text-anchor", "end")
      .attr("x", xScale(data.series.length - 1))
      .attr("y", chartHeight + margin.right + 5)
      .text("Homens recebem mais →");

    svg
      .append("g")
      .append("text")
      .style("fill", colors.women)
      .attr("class", "x label women")
      .attr("text-anchor", "begin")
      .attr("x", xScale(0))
      .attr("y", chartHeight + margin.right + 5)
      .text("← Mulheres recebem mais");

    var lines = svg
      .append("g")
      .attr("class", "lines")
      .selectAll(".line")
      .data(data.series)
      .enter()
      .append("line")
      .attr("class", (d, i) => `data bar--x-${i}`)
      .style("stroke", function(d) {
        return d.relativeGap > 0 ? colors.men : colors.women;
      })
      .call(self.positionLine);

    svg.on("mouseout", function() {
      if (self.state.frozen) return;

      // change app state
      self._debouncedOnChangeMouseX(null, null);
    });

    svg.on("mousemove", function(param1, param2, param3, param4) {
      // ignore mouse movements when chart is frozen
      if (self.state.frozen) return;

      // get hover meta
      const mouse = d3.mouse(this.component.childNodes[0]);
      var mouseX = mouse[0];

      var hoveredProfessionId = Math.round(self.xLinearScale.invert(mouseX));

      // MouseX should fit bounds
      const lastProfessionID = data.series.length - 1;
      if (hoveredProfessionId < 0) {
        hoveredProfessionId = 0;
        mouseX = xBuffer;
      } else if (hoveredProfessionId > lastProfessionID) {
        hoveredProfessionId = lastProfessionID;
        mouseX = width - xBuffer;
      }

      // change app state
      self._debouncedOnChangeMouseX(mouseX, hoveredProfessionId);
    });
  }

  updatePositions() {
    var { positionLine, xScale } = this;

    var faux = this.props.connectFauxDOM("div", "chart");
    var svg = d3.select(faux).select("svg");

    svg.select("g").selectAll(".lines line").call(positionLine);

    this.props.animateFauxDOM(100);
  }

  resetChart() {
    var faux = this.props.connectFauxDOM("div", "chart");
    var svg = d3.select(faux).select("svg");
    const { yScale, xLinearScale } = this;

    svg
      .select("g")
      .selectAll(".lines line")
      .style("stroke-width", 2)
      .style("opacity", 1)
      .attr("x1", function(d, i) {
        return xLinearScale(i);
      })
      .attr("y1", function(d, i) {
        return yScale(0);
      })
      .attr("x2", function(d, i) {
        return xLinearScale(i);
      })
      .attr("y2", function(d, i) {
        return yScale(Math.abs(d.relativeGap));
      });

    this.props.animateFauxDOM(100);
  }
}

Chart.defaultProps = {
  chart: "",
  loaded: false
};

const FauxChart = withFauxDOM(Chart);

export default FauxChart;
