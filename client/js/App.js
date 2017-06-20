import "babel-polyfill";
import React, { Component } from "react";
import { render } from "react-dom";
import * as d3 from "d3";

import styled from "styled-components";
import { Flex, Box } from "grid-styled";
import theme from "./constants/theme";
import ThemedApp from "./containers/ThemedApp";

import Chart from "./components/Chart";
import Infobox from "./components/Infobox";

const Wrapper = styled.div`
  margin-left: 100px;
  margin-top: 50px;
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

          data.numberOfProfessions++;
          if (result.relativeGap > 0) data.professionsWomanEarnLess++;

          return result;
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
            Segundo dados do IBGE, as mulheres
            recebem salário menor do que homens em{" "}
            {this.state.data.professionsWomanEarnLess}{" "}
            de {this.state.data.numberOfProfessions} profissões monitoradas.
          </p>
          <Chart data={this.state.data} />
          <Infobox data={this.state.data} />
          <p>
            Esta visualização faz parte do Especial Trabalho, série de
            reportagens da Genêro e Número
          </p>
        </Wrapper>
      </ThemedApp>
    );
  }
}

render(<App />, document.getElementById("root"));
