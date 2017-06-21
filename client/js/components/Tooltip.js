import React from "react";
import * as d3 from "d3";

const Tooltip = ({ style, d }) => {
  var higherSalary;
  var lowerSalary;
  var higherSalaryGender;
  var lowerSalaryGender;

  const percentage = d3.format(".0%");

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
    <div className="tooltip" style={style}>
      <p>
        {higherSalaryGender} ganham {percentage(Math.abs(d.relativeGap))} mais
      </p>
    </div>
  );
};

export default Tooltip;
