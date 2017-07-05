import "babel-polyfill";
import _ from "lodash";
import React, { Component } from "react";
import { render } from "react-dom";
import { csv, format, ascending, max } from "d3";

import styled from "styled-components";
import theme from "./constants/theme";
import ThemedApp from "./containers/ThemedApp";

import Chart from "./components/Chart";

const Wrapper = styled.div`
  border: 1px solid black;
  margin: 20px;
  padding: 10px 30px;
`;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {
        numberOfProfessions: 0,
        professionsWomanEarnLess: 0
      }
    };

    // load data
    var self = this;
    csv("data-rais.csv", function(csvData) {
      var data = self.state.data;

      data["series"] = csvData
        .map(function(d) {
          // get profession and salaries for plotting
          return {
            profession: d["Profissão"],
            menSalary: parseFloat(
              d["Masculino, Todas as Cores"].replace(",", "")
            ),
            womenSalary: parseFloat(
              d["Feminino, Todas as Cores"].replace(",", "")
            )
          };
        })
        .filter(function(d) {
          return (
            d.menSalary && d.menSalary > 0 && d.womenSalary && d.womenSalary > 0
          );
        })
        .map(function(d) {
          // Calculate absolute and relative gap
          d.absoluteGap = d.menSalary - d.womenSalary;
          d.relativeGap = d.absoluteGap / Math.min(d.menSalary, d.womenSalary);
          return d;
        })
        .map(function(d) {
          if (d.absoluteGap > 0) data.professionsWomanEarnLess++;

          // Make racial ranking, if data is available
          var ranking = [];

          for (let profile of [
            "Feminino, Cor Branca",
            "Masculino, Cor Branca",
            "Feminino, Cor Parda",
            "Masculino, Cor Parda",
            "Feminino, Cor Preta",
            "Masculino, Cor Preta"
          ]) {
            if (d[profile]) {
              ranking.push({
                profile: profile,
                salary: parseFloat(d[profile].replace(",", "")),
                gender: profile.split(",")[0]
              });
            }
          }

          if (ranking.length == 0) return d;

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

          // add ranking to d
          d.ranking = ranking;

          return d;
        })
        .sort(function(a, b) {
          return ascending(a.relativeGap, b.relativeGap);
        });

      data.numberOfProfessions = data.series.length;

      data.relativeGapMax = max(data.series, function(d) {
        return Math.abs(d.relativeGap);
      });

      self.setState({ data: data });
    });
  }

  render() {
    return (
      <ThemedApp theme={theme}>
        <Wrapper>
          <h1>Diferenças salariais entre homens e mulheres</h1>
          <p>
            Segundo pesquisa CAGED{" "}2016, do Ministério do Trabalho e
            Emprego, homens ganham mais em{" "}
            {format(".0%")(
              this.state.data.professionsWomanEarnLess /
                this.state.data.numberOfProfessions
            )}{" "}
            {" "}
            das profissões.
          </p>
          <Chart data={this.state.data} />
        </Wrapper>
      </ThemedApp>
    );
  }
}

render(<App />, document.getElementById("root"));
