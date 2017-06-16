import "babel-polyfill";
import React, { Component } from "react";
import { render } from "react-dom";
import styled from "styled-components";
import * as d3 from "d3";

import ThemedApp from "./containers/ThemedApp";
import Chart from "./Chart";

const theme = {
  color: "black",
  border: "lightgrey"
};

const colors = ["rgb(114,135,144)", "rgb(171,112,128)"];

const StyledChart = styled(Chart)`
  .point-men {
    fill: red;
  }

  .point-women {
    fill: green;
  }
`;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {
        max: 0
      }
    };

    // load data
    var self = this;
    d3.csv("data.csv", function(csvData) {
      var data = self.state.data;

      data["series"] = csvData
        .filter(function(d) {
          return d["Feminino Branca"] && d["Masculino Branca"];
        })
        .map(function(d) {
          var result = {
            profession: d["Categorias"],
            men: parseFloat(d["Masculino Branca"].replace(",", "")),
            women: parseFloat(d["Feminino Branca"].replace(",", ""))
          };

          result.max = Math.max(result.men, result.women);
          result.min = Math.min(result.men, result.women);
          result.gap = result.men - result.women;

          data.max = Math.max(data.max, result.max);

          return result;
        });
      self.setState({ data: data });
    });
  }

  render() {
    return (
      <ThemedApp theme={theme}>
        <h3>Salário mensal: Homens x Mulheres</h3>
        <p>Destaque uma profissão: </p>
        <StyledChart data={this.state.data} />
      </ThemedApp>
    );
  }
}

render(<App />, document.getElementById("root"));
