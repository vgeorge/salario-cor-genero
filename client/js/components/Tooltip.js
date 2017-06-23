import React from "react";
import { format } from "d3";
import styled from "styled-components";
import brCurrency from "../helpers/brCurrency.js";

const Wrapper = styled.div`
  pointer-events: none;
  position: absolute;
  z-index: 10;
  display: inline-block;
  width: 200px;
  background-color: ${({ theme }) => theme.infobox.background};
  border: solid 1px ${({ theme }) => theme.background};
  border-radius: 2px;
  padding: 10px;
  text-align: left;
  width: 250;


  h2 {
    font-size: 13px;
  }

  ol {
    padding: 0 10px 0 10px
  }

  h3, p, li {
    font-size: 10px;
  }

  p.salary {
    margin-top: 3px;
    margin-bottom: 3px;
  }

  h2.highlight {
    color: ${({ d, theme }) =>
      d && d.absoluteGap < 0 ? theme.womenColor : theme.menColor};
  }


`;

const Tooltip = ({ style, d }) => {
  var higherSalary;
  var lowerSalary;
  var higherSalaryGender;
  var lowerSalaryGender;

  const percentage = format(".0%");

  if (d.menSalary > d.womenSalary) {
    higherSalary = d.menSalary;
    higherSalaryGender = "Homens";
    lowerSalary = d.womenSalary;
    lowerSalaryGender = "Mulheres";
  } else {
    higherSalary = d.womenSalary;
    higherSalaryGender = "Mulheres";
    lowerSalary = d.menSalary;
    lowerSalaryGender = "Homens";
  }

  return (
    <Wrapper className="tooltip" d={d} style={style}>
      <h2>
        {d.profession}
      </h2>
      {d.ranking &&
        <div>
          <h3>
            Ranking por gênero e cor
          </h3>
          <ol>
            {d.ranking.map((d, i) => {
              return (
                <li key={i + 1}>
                  {brCurrency(d.salary)} {d.profile}
                </li>
              );
            })}
          </ol>
        </div>}
      <h3>
        Salário médio sem distinção de cor
      </h3>
      <p className="salary men">
        Homens: {brCurrency(d.menSalary)}
      </p>
      <p className="salary women">
        Mulheres: {brCurrency(d.womenSalary)}
      </p>
      <h3 className="salary">
        Diferença: {brCurrency(Math.abs(d.absoluteGap))}
      </h3>
      <h2 className="highlight {d.absoluteGap > 0 ? 'men' : 'women'}">
        {higherSalaryGender} ganham {percentage(Math.abs(d.relativeGap))} mais
      </h2>

    </Wrapper>
  );
};

export default Tooltip;
