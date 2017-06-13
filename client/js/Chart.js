import React from 'react';
import * as d3 from 'd3';
import { withFauxDOM } from 'react-faux-dom';

class Chart extends React.Component {
  constructor(props) {
    super(props);

    // bind methods
    this.renderD3 = this.renderD3.bind(this);
  }

  componentDidUpdate () {
    this.renderD3()
  }

  render() {
    return (
      <div>
        {this.props.chart}
      </div>
    )
  }

  renderD3 () {
    var self = this;
    var data = this.props.data;

    var domain = this.props.domain;
    var margin = {top: 20, right: 20, bottom: 30, left: 100}
    var width = 960 - margin.left - margin.right
    var height = 500 - margin.top - margin.bottom
    var color = ["rgb(114,135,144)", "rgb(171,112,128)"];
    var points = {
      radius: {
        higher: 3,
        lower: 1
      },
      opacity: 0.5
    }

    var faux = this.props.connectFauxDOM('div', 'chart')

    // apply margins
    var svg = d3.select(faux).append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // return empty node if data is not defined yet
    if (!data.series) return;

    // define scales
    var scales = {
      x: d3.scaleLinear().range([0, width]).domain([0, data.series.length]),
      y: d3.scaleLinear().range([height, 0]).domain([0, data.max])
    }

    // sort data
    data.series.sort(function(a,b){
      return d3.ascending(a.men, b.men);
    });

    // append data and svg elements
    var binding = svg.selectAll('g').data(data.series);
    var enterG = binding.enter().append('g');

    // men points
    enterG
      .append('circle')
        .style("fill", color[0])
        .style("opacity", points.opacity)
        .attr('class', 'men-point')
        .attr('cx', function(d, i) { return scales.x(i); })
        .attr('cy', function(d) { return scales.y(d.men); })
        .attr('r', function(d) { return d.men > d.women ? points.radius.higher : points.radius.lower ; });

    // woman points
    enterG
      .append('circle')
        .style("fill", color[1])
        .style("opacity", points.opacity)
        .attr('class', 'women-point')
        .attr('cx', function(d, i) { return scales.x(i); })
        .attr('cy', function(d) { return scales.y(d.women); })
        .attr('r', function(d) { return d.women > d.men ? points.radius.higher : points.radius.lower ; });

    // gap line
    enterG
      .append('path')
        .style("stroke", function(d){ return d.gap > 0 ? color[0] : color[1] })
        .attr('d', function(d, i){
          return 'M ' + scales.x(i) + ' ' + scales.y(d.men) + ' L ' + scales.x(i) + ' ' + scales.y(d.women)
        })


    // add y axis
    var axis = d3
      .axisRight(scales.y)
      .ticks(5)
      .tickSize(width);

    // formart axis' ticks
    svg
      .append("g")
      .call(axis)
      .call(function(g) {
      	g.selectAll('text').remove();
        g.select(".domain").remove();
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
      });

    // format axis labels
    var axisLabel = d3
      .axisLeft(scales.y)
      .ticks(5)
      .tickFormat(d3.formatLocale({
          "decimal": ",",
          "thousands": ".",
          "grouping": [3],
          "currency": ["R$ ", ""]
        }).format("$,.2f")
      );

    // remove unwanted tick lines and domain
    svg
      .append("g")
      .call(axisLabel)
      .call(function(g) {
        g.selectAll(".tick line").remove();
        g.select(".domain").remove();
      });

  }
}

Chart.defaultProps = {
  chart: 'loading'
}

const FauxChart = withFauxDOM(Chart);

export default FauxChart;
