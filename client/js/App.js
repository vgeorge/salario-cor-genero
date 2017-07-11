import "babel-polyfill";
import { debounce } from "lodash";
import React, { Component } from "react";
import { render } from "react-dom";
import { csv, ascending, max } from "d3";
import styled, { injectGlobal } from "styled-components";
import config from "./config";

import Head from "./components/Head";
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
  height: ${props => props.containerHeight}px;

  h1 { margin-top: 20px }
`;

class App extends Component {
  constructor(props) {
    super(props);

    const { outerBox } = config;

    this._onResize = this._onResize.bind(this);
    this._onSearchBoxChange = this._onSearchBoxChange.bind(this);
    this._onChangeMouseX = this._onChangeMouseX.bind(this);

    this.state = {
      data: {
        numberOfProfessions: 0,
        professionsWomanEarnLess: 0
      },
      dimensions: {
        containerHeight:
          window.innerHeight - outerBox.margin * 2 - outerBox.padding.top * 2,
        containerWidth:
          window.innerWidth - outerBox.margin * 2 - outerBox.padding.left * 2,
        headHeight: 130
      }
    };
    this.state.dimensions.svgWidth = this.state.dimensions.containerWidth;

    // load data
    var self = this;
    csv("data-rais.csv", function(csvData) {
      var data = Object.assign({}, self.state.data);

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

  updateHeadHeight(headHeight) {
    if (headHeight != this.state.dimensions.headHeight) {
      this.setState({
        dimensions: Object.assign({}, this.state.dimensions, { headHeight })
      });
    }
  }

  _onResize() {
    const { outerBox } = config;

    var newDimensions = {
      containerHeight:
        window.innerHeight - 2 * outerBox.margin - 2 * outerBox.padding.top,
      containerWidth:
        window.innerWidth - 2 * outerBox.margin - 2 * outerBox.padding.left
    };

    newDimensions.svgWidth = newDimensions.containerWidth;

    newDimensions.headHeight =
      this.state.dimensions.headHeight || this.headHeight || 150;

    this.setState({ dimensions: newDimensions });

    return newDimensions;
  }

  componentDidMount() {
    this._debouncedResize = debounce(this._onResize, config.debounceTime);
    window.addEventListener("resize", this._debouncedResize, false);
  }

  _onSearchBoxChange(profession) {
    if (!profession) {
      this.setState({
        selectedProfession: null,
        frozen: false
      });
    } else {
      this.setState({
        selectedProfession: profession.value,
        frozen: true
      });
    }
  }

  // _onSelectedProfessionChange(professionId) {
  //   this.setState({
  //     selectedProfession: professionId
  //   });
  // }

  _onChangeMouseX(newMouseX, hoveredProfessionId) {
    if (!this.state.frozen)
      this.setState({
        mouseX: newMouseX,
        selectedProfession: hoveredProfessionId
      });
  }

  render() {
    var self = this;
    var { data, selectedProfession, dimensions, frozen } = this.state;
    const { margin, padding } = config.outerBox;

    return (
      <Wrapper
        containerHeight={dimensions.containerHeight}
        margin={margin}
        padding={padding}
      >
        <Head
          data={data}
          selectedProfession={selectedProfession}
          frozen={frozen}
          _onSearchBoxChange={self._onSearchBoxChange}
          getHeight={headHeight => {
            self.updateHeadHeight(headHeight);
          }}
        />
        {data.series &&
          <Chart {...this.state} _onChangeMouseX={self._onChangeMouseX} />}
      </Wrapper>
    );
  }
}

render(<App />, document.getElementById("root"));
