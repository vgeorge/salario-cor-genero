import "babel-polyfill";
import React, { Component } from "react";
import { render } from "react-dom";
import styled from "styled-components";
import * as d3 from "d3";

import ThemedApp from "./containers/ThemedApp";
import AbsoluteGapChart from "./charts/AbsoluteGap";
import RelativeGapChart from "./charts/RelativeGap";

const theme = {
  menColor: "rgb(114,135,144)",
  womenColor: "rgb(171,112,128)",
  color: "black",
  border: "lightgrey"
};

const colors = ["rgb(114,135,144)", "rgb(171,112,128)"];

// const StyledChart = styled(Chart)`
//   .point-men {
//     fill: red;
//   }
//
//   .point-women {
//     fill: green;
//   }
// `;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {}
    };

    // load data
    var self = this;
    d3.csv("data.csv", function(csvData) {
      var data = self.state.data;

      data["series"] = csvData
        .map(function(d) {
          return {
            profession: d["Categorias"],
            men: parseFloat(d["Masculino Branca"].replace(",", "")),
            women: parseFloat(d["Feminino Branca"].replace(",", ""))
          };
        })
        .filter(function(d) {
          return d.women && d.men && (d.men - d.women) / d.women < 1;
        })
        .map(function(d) {
          var result = d;

          // Collect gaps

          result.absoluteGap = result.men - result.women;
          result.relativeGap = result.absoluteGap / result.women;

          // Collect domains

          data.absoluteMax = Math.max(
            data.absoluteMax || result.men,
            result.men,
            result.women
          );

          data.absoluteMin = Math.min(
            data.absoluteMin || result.men,
            result.men,
            result.women
          );

          data.relativeGapMax = Math.max(
            data.relativeGapMax || result.relativeGap,
            result.relativeGap
          );

          data.relativeGapMin = Math.min(
            data.relativeGapMin || result.relativeGap,
            result.relativeGap
          );

          return result;
        });

      self.setState({ data: data });
    });
  }

  render() {
    return (
      <ThemedApp theme={theme}>
        <div>
          <h3>Salário mensal: Homens x Mulheres</h3>
          <p>Destaque uma profissão: </p>
          <RelativeGapChart data={this.state.data} />
        </div>
      </ThemedApp>
    );
  }
}

render(<App />, document.getElementById("root"));
