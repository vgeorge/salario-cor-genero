import "babel-polyfill";
import React, { Component } from "react";
import { render } from "react-dom";
import { csv, format } from "d3";

import styled from "styled-components";
import { Flex, Box } from "grid-styled";
import theme from "./constants/theme";
import ThemedApp from "./containers/ThemedApp";

import Chart from "./components/Chart";
import Infobox from "./components/Infobox";

const Wrapper = styled.div`
`;

class App extends Component {
  constructor(props) {
    super(props);

    // bind methods
    this._changeHover = this._changeHover.bind(this);

    this.state = {
      data: {
        numberOfProfessions: 0,
        professionsWomanEarnLess: 0
      }
    };

    // load data
    var self = this;
    csv("data.csv", function(csvData) {
      var data = self.state.data;

      data["series"] = csvData
        .map(function(d) {
          // get profession and salaries for plotting
          var result = {
            profession: d["Categorias"],
            menSalary: parseFloat(d["Homens brancos"].replace(",", "")),
            womenSalary: parseFloat(d["Mulheres brancas"].replace(",", ""))
          };

          // get available profiles
          var ranking = [];

          for (let profile of [
            "Mulheres brancas",
            "Homens brancos",
            "Mulheres pardas",
            "Homens pardos",
            "Mulheres pretas",
            "Homens pretas"
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
            (d.menSalary - d.womenSalary) / d.womenSalary < 2
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

          data.numberOfProfessions++;
          if (result.relativeGap > 0) data.professionsWomanEarnLess++;

          return result;
        });

      self.setState({ data: data });
    });
  }

  _changeHover(hover) {
    this.setState({ hover });
  }

  render() {
    return (
      <ThemedApp theme={theme}>
        <Wrapper>
          <h1>Diferenças salariais entre homens e mulheres</h1>
          <p>
            Segundo o IBGE, homens ganham mais em {" "}
            {this.state.data.professionsWomanEarnLess}{" "}
            de {this.state.data.numberOfProfessions} ({format(".0%")(
              this.state.data.professionsWomanEarnLess /
                this.state.data.numberOfProfessions
            )}) das profissões pesquisadas.
          </p>
          <Chart data={this.state.data} onChange={this._changeHover} />
          <Infobox data={this.state.data} hover={this.state.hover} />
        </Wrapper>
      </ThemedApp>
    );
  }
}

render(<App />, document.getElementById("root"));
