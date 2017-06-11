import React, { Component } from 'react';
import {render} from 'react-dom';
import { Col } from 'react-bootstrap';
import Chart from './Chart';
import * as d3 from 'd3';

class App extends Component {
  constructor(props) {
     super(props);
  }

  render() {
    return (
      <div className="container">
        <Chart />
      </div>
    )
  }
}

render(<App />, document.getElementById('root'));
