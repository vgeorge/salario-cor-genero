import React from 'react';
import * as d3 from 'd3';
import ReactFauxDOM from 'react-faux-dom';

class MyReactComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataset: {
        max: 0
      }
    }

    // load data
    var self = this;
    d3.csv('data.csv', function(data){
      var dataset = self.state.dataset;

      dataset['series'] = data.filter(function(d){ return d['Feminino Branca'] && d['Masculino Branca'] }).map(function(d){
        var result = {
          'profession': d['Categorias'],
          'men': parseFloat(d['Masculino Branca'].replace(',', '')),
          'women': parseFloat(d['Feminino Branca'].replace(',', '')),
        }

        result.max = Math.max(result.men, result.women);
        result.min = Math.min(result.men, result.women);
        result.gap = result.men - result.women;

        dataset.max = Math.max(dataset.max, result.max);

        return result;
      });
      self.setState({dataset: dataset});
    });
  }


  render () {
    var data = this.state.dataset;

    var domain = this.props.domain;
    var margin = {top: 20, right: 20, bottom: 30, left: 50}
    var width = 960 - margin.left - margin.right
    var height = 500 - margin.top - margin.bottom

    console.log('data');
    console.log(data);

    var node = ReactFauxDOM.createElement('svg')

    var svg = d3.select(node)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    if (!data.series) return node.toReact();

    var scales = {
      x: d3.scaleLinear().range([0, width]).domain([0, data.series.length]),
      y: d3.scaleLinear().range([height, 0]).domain([0, data.max])
    }


    data.series.sort(function(a,b){
      return d3.ascending(a.men, b.men);
    });

    var binding = svg.selectAll('g').data(data.series);

    var enterG = binding.enter().append('g');

    enterG
      .append('circle')
        .style("fill", "black")
        .attr('class', 'men-point')
        .attr('cx', function(d, i) { return scales.x(i); })
        .attr('cy', function(d) { return scales.y(d.men); })
        .attr('r', function(d) { return 2; });

    enterG
      .append('circle')
        .style("fill", "red")
        .attr('class', 'women-point')
        .attr('cx', function(d, i) { return scales.x(i); })
        .attr('cy', function(d) { return scales.y(d.women); })
        .attr('r', function(d) { return 2; });

    enterG
      .append('circle')
        .style("fill", "red")
        .attr('class', 'women-point')
        .attr('cx', function(d, i) { return scales.x(i); })
        .attr('cy', function(d) { return scales.y(d.women); })
        .attr('r', function(d) { return 2; });

    var axis = d3
      .axisRight(scales.y)
      .tickSize(width)
      .tickFormat(d3.formatLocale({
          "decimal": ",",
          "thousands": ".",
          "grouping": [3],
          "currency": ["R$ ", ""]
        }).format("$,.2f")
      );

    svg
      .append("g")
      .call(axis)
      .call(function(g) {
      	g.selectAll('text').attr('x', 4).attr('dy', -4);
      });

    return node.toReact()
  }
}

MyReactComponent.defaultProps = {
  chart: 'loading'
}

export default MyReactComponent;
