import "babel-polyfill";
import { debounce } from "lodash";
import React, { Component } from "react";
import { render } from "react-dom";
import { csv, format, ascending, max } from "d3";
import styled, { injectGlobal } from "styled-components";
import config from "./config";

import Chart from "./components/Chart";

/* eslint-disable no-unused-expressions */
injectGlobal`
  body {
    margin: 0;
    overflow: hidden;
  }
`;

const Wrapper = styled.div`
  font-family: Merriweather sans, sans-serif;
  border: 1px solid black;
  margin: ${props => props.margin}px;
  padding: ${props => props.padding.top}px ${props => props.padding.left}px;
  height: ${props =>
    props.windowHeight - props.margin * 2 - props.padding.top * 2}px;
`;

class App extends Component {
  constructor(props) {
    super(props);

    this._onResize = this._onResize.bind(this);

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

  _onResize() {
    var windowHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    this.setState({ windowHeight });
  }

  componentDidMount() {
    this._debouncedResize = debounce(this._onResize, config.debounceTime);
    window.addEventListener("resize", this._debouncedResize, false);
  }

  render() {
    var { data, windowHeight } = this.state;
    const { margin, padding } = config.outerBox;

    return (
      <Wrapper
        windowHeight={windowHeight || window.innerHeight}
        margin={margin}
        padding={padding}
      >
        <h1>Diferenças salariais entre homens e mulheres</h1>
        <p>
          Segundo pesquisa CAGED{" "}2016, do Ministério do Trabalho e
          Emprego, homens ganham mais em{" "}
          {format(".0%")(
            data.professionsWomanEarnLess / data.numberOfProfessions
          )}{" "}
          {" "}
          das profissões.
        </p>
        <Chart data={data} />
      </Wrapper>
    );
  }
}

render(<App />, document.getElementById("root"));
