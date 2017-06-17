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
          // get profession and salaries for plotting
          var result = {
            profession: d["Categorias"],
            menSalary: parseFloat(d["Masculino Branca"].replace(",", "")),
            womenSalary: parseFloat(d["Feminino Branca"].replace(",", ""))
          };

          // get available profiles
          var ranking = [];

          for (let profile of [
            "Feminino Branca",
            "Masculino Branca",
            "Feminino Parda",
            "Masculino Parda",
            "Feminino Preta",
            "Masculino Preta"
          ]) {
            if (d[profile]) {
              ranking.push({
                profile: profile,
                salary: parseFloat(d[profile].replace(",", ""))
              });
            }
          }

          // sort ranking
          ranking = ranking.sort((a, b) => {
            return a.salary < b.salary;
          });

          // add relative gaps to each
          const bestSalary = ranking[0].salary;
          ranking = ranking.map(a => {
            a.relativeGap = (a.salary - bestSalary) / bestSalary;
            return a;
          });

          // add ranking to result
          result.ranking = ranking;

          return result;
        })
        .filter(function(d) {
          return (
            d.womenSalary &&
            d.menSalary &&
            (d.menSalary - d.womenSalary) / d.womenSalary < 1
          );
        })
        .map(function(d) {
          var result = d;

          // Collect gaps

          result.absoluteGap = result.menSalary - result.womenSalary;
          result.relativeGap = result.absoluteGap / result.womenSalary;

          // Collect domains

          data.absoluteMax = Math.max(
            data.absoluteMax || result.menSalary,
            result.menSalary,
            result.womenSalary
          );

          data.absoluteMin = Math.min(
            data.absoluteMin || result.menSalary,
            result.menSalary,
            result.womenSalary
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
