import React from "react";
import Dimensions from "react-dimensions";
import styled from "styled-components";

/* D3.js */
import * as d3 from "d3";
import d3Fisheye from "../helpers/d3-fisheye.js";

/* Components */
import Infobox from "./Infobox";
import SearchBox from "./SearchBox";
import { withFauxDOM } from "react-faux-dom";
import WindowResizeListener from "../helpers/WindowResizeListener";

/* Chart config */
import colors from "../config/colors.js";

const Wrapper = styled.div`
  position: relative;
  display: inline-block;

  .data {
    pointer-events: none;
  }

  .tick {
    pointer-events: none;
  }

  .tooltip {
    visibility: ${({ hover }) => (hover ? "visible" : "hidden")};
    -webkit-transition: top .2s ease-out, left .2s ease-out;
  }
`;

class Chart extends React.Component {
  constructor(props) {
    super(props);

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    this.chartConfig = {
      margin: margin,
      height: window.innerHeight - 350,
      xBuffer: 20,
      barStroke: 2
    };

    this.state = {};

    // Bindings
    this.renderD3 = this.renderD3.bind(this);
    this.updatePositions = this.updatePositions.bind(this);
    this.positionLine = this.positionLine.bind(this);
    this.resetChart = this.resetChart.bind(this);
    this.onProfessionEnter = this.onProfessionEnter.bind(this);
    this._changeWindowDimensions = this._changeWindowDimensions.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.loaded) {
      this.loaded = true;
      this.renderD3();
    }
  }

  onProfessionEnter(profession) {
    if (!profession) {
      this.setState({
        selectedProfession: null,
        frozen: false
      });
      this.resetChart();
    } else {
      this.setState({
        selectedProfession: profession.value,
        frozen: true
      });
      this.updatePositions();
    }
  }

  _changeWindowDimensions(windowSize) {
    const { margin, xBuffer } = this.chartConfig;
    const { containerWidth } = this.props;
    const width = this.props.containerWidth - margin.left - margin.right;

    // update scales
    this.xLinerScale.range([xBuffer, width - xBuffer]);
    this.xFisheyeScale.range([xBuffer, width - xBuffer]);

    // get faux dom
    var faux = this.props.connectFauxDOM("div", "chart");
    var svg = d3.select(faux).select("svg");

    // update elements width
    svg.attr("width", containerWidth);
    svg.select("rect").attr("width", containerWidth);

    svg.select(".label.men").attr("x", width - xBuffer);

    //
    this.updatePositions();
  }

  render() {
    const self = this;
    const { loaded } = this;

    return (
      <Wrapper className="relative-gap-chart">
        {loaded &&
          <WindowResizeListener onResize={this._changeWindowDimensions} />}
        {loaded &&
          this.state.selectedProfession >= 0 &&
          <Infobox
            data={this.props.data}
            selectedProfession={this.state.selectedProfession}
          />}
        {loaded &&
          <SearchBox
            data={this.props.data}
            selectedProfession={this.state.selectedProfession}
            onProfessionEnter={this.onProfessionEnter}
          />}
        {this.props.chart}

      </Wrapper>
    );
  }

  positionLine(line) {
    const { xScale, yScale } = this;
    const { selectedProfession } = this.state;

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
        return yScale(
          Math.abs(d.relativeGap * (selectedProfession == i ? 1.5 : 1))
        );
      });
  }

  renderD3() {
    var self = this;
    var { data, domain, containerWidth } = this.props;

    // Get chart dimensions
    const { margin, height, xBuffer, barStroke } = self.chartConfig;

    const width = containerWidth - margin.left - margin.right;

    // Connect to faux dom
    var faux = this.props.connectFauxDOM("div", "chart");

    // Create svg and set origin
    var svg = d3
      .select(faux)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add a background rect for mousemove.
    svg
      .append("rect")
      .attr("class", "background")
      .attr("fill", "#fff")
      .attr("width", width)
      .attr("height", height);

    // Stop composing if data is not avaliable
    if (!data.series) return;

    // Create fisheye scale
    this.xFisheyeScale = d3Fisheye
      .scale(d3.scale.linear)
      .domain([0, data.series.length])
      .range([xBuffer, width - xBuffer]);

    // Create linear scale
    var xScale = (this.xScale = this.xLinerScale = d3.scale
      .linear()
      .domain([0, data.series.length])
      .range([xBuffer, width - xBuffer]));

    var yScale = (this.yScale = d3.scale
      .linear()
      .domain([0, data.relativeGapMax + 0.1])
      .range([height, 0]));

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

    // add y axis
    var axis = d3.svg
      .axis()
      .orient("right")
      .scale(yScale)
      .ticks(3)
      .tickSize(width);

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
    var axisLabel = d3.svg.axis().orient("left").scale(yScale).ticks(5, "%");

    svg
      .append("g")
      .append("text")
      .style("fill", colors.men)
      .attr("class", "x label men")
      .attr("text-anchor", "end")
      .attr("x", xScale(data.series.length - 1))
      .attr("y", height + margin.right + 5)
      .text("Homens recebem mais →");

    svg
      .append("g")
      .append("text")
      .style("fill", colors.women)
      .attr("class", "x label women")
      .attr("text-anchor", "begin")
      .attr("x", xScale(0))
      .attr("y", height + margin.right + 5)
      .text("← Mulheres recebem mais");

    // remove unwanted tick lines and domain
    svg.append("g").call(axisLabel).call(function(g) {
      g.selectAll(".tick line").remove();
      g.select(".domain").remove();
    });

    svg.on("mouseout", function() {
      if (self.state.frozen) return;
      self.resetChart();
    });

    svg.on("click", function() {
      var frozen = true;
      if (self.state && self.state.frozen) {
        frozen = false;
      }

      self.setState({
        frozen: frozen
      });
    });

    svg.on("mousemove", function(param1, param2, param3, param4) {
      if (self.state.frozen) return;
      var mouse = d3.mouse(this.component.childNodes[0]);
      var { numberOfProfessions } = data;
      self.xScale = self.xFisheyeScale.distortion(10).focus(mouse[0]);

      var position = Math.round(self.xLinerScale.invert(mouse[0]));

      if (position < 0) {
        position = 0;
      } else if (position > numberOfProfessions - 1) {
        position = numberOfProfessions - 1;
      }

      self.setState({ selectedProfession: position });

      self.updatePositions();
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
    const { yScale, xLinerScale } = this;

    svg
      .select("g")
      .selectAll(".lines line")
      .style("stroke-width", 2)
      .style("opacity", 1)
      .attr("x1", function(d, i) {
        return xLinerScale(i);
      })
      .attr("y1", function(d, i) {
        return yScale(0);
      })
      .attr("x2", function(d, i) {
        return xLinerScale(i);
      })
      .attr("y2", function(d, i) {
        return yScale(Math.abs(d.relativeGap));
      });

    this.props.animateFauxDOM(100);
  }
}

Chart.defaultProps = {
  chart: "Carregando...",
  loaded: false
};

const FauxChart = withFauxDOM(Chart);

export default Dimensions()(FauxChart);
