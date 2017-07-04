import React, { Component } from "react";
import { render } from "react-dom";
import styled from "styled-components";
import * as d3 from "d3";

const MaleIcon = require("react-icons/lib/fa/male");
const FemaleIcon = require("react-icons/lib/fa/female");

const Wrapper = styled.div`
  position: absolute;
  left: 200px;
  top: 150px;
  border: 1px solid black;
  padding: 10px;
  background: white;
`;

class Infobox extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var { selectedProfession, data } = this.props;

    const profession = data.series[selectedProfession];

    return (
      <Wrapper>
        <h1>
          Salário Médio
        </h1>
        <p>
          <MaleIcon /> R${profession.menSalary}
        </p>
        <p>
          <FemaleIcon /> R${profession.womenSalary}
        </p>
        <p>
          Diferença: {d3.format(".1%")(profession.relativeGap)}
        </p>
      </Wrapper>
    );
  }
}

export default Infobox;
