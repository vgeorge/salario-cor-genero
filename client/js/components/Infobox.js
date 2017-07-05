import React, { Component } from "react";
import { render } from "react-dom";
import styled from "styled-components";
import format from "../helpers/format";

const MaleIcon = require("react-icons/lib/fa/male");
const FemaleIcon = require("react-icons/lib/fa/female");

const Wrapper = styled.div`
  position: absolute;
  left: 110px;
  top: 80px;
  border: 1px solid #ccc;
  padding: 10px;
  background: white;
  height: 170px;
  width: 150px;
  h3, p {
    text-align: center;
  }
`;

class Infobox extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var { selectedProfession, data } = this.props;

    const profession = data.series[selectedProfession];

    const genderWithBetterSalary = profession.relativeGap > 0
      ? "Homens"
      : "Mulheres";

    return (
      <Wrapper>
        <h3>
          Salário Médio
        </h3>
        <p>
          <MaleIcon /> {format.currency(profession.menSalary)}
        </p>
        <p>
          <FemaleIcon /> {format.currency(profession.womenSalary)}
        </p>
        <p>
          {genderWithBetterSalary} recebem{" "}
          {format.percent(Math.abs(profession.relativeGap))} mais
        </p>
      </Wrapper>
    );
  }
}

export default Infobox;
