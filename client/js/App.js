import React, { Component } from 'react';
import {render} from 'react-dom';
import * as d3 from 'd3';

import Chart from './Chart';

class App extends Component {
  constructor(props) {
     super(props);

     this.state = {
       data: {
         max: 0
       }
     }

     // load data
     var self = this;
     d3.csv('data.csv', function(csvData){
       var data = self.state.data;

       data['series'] = csvData.filter(function(d){ return d['Feminino Branca'] && d['Masculino Branca'] }).map(function(d){
         var result = {
           'profession': d['Categorias'],
           'men': parseFloat(d['Masculino Branca'].replace(',', '')),
           'women': parseFloat(d['Feminino Branca'].replace(',', '')),
         }

         result.max = Math.max(result.men, result.women);
         result.min = Math.min(result.men, result.women);
         result.gap = result.men - result.women;

         data.max = Math.max(data.max, result.max);

         return result;
       });
       self.setState({data: data});
     });

  }

  render() {
    return (
      <div className="container">
        <h3>Salário mensal: Homens x Mulheres</h3>
        <p>Destaque uma profissão: </p>
        <Chart data={this.state.data} />
      </div>
    )
  }
}

render(<App />, document.getElementById('root'));
