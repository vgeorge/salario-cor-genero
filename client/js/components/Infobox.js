import React, { Component } from "react";
import { render } from "react-dom";

import brCurrency from "../helpers/brCurrency";

class Infobox extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { hover } = this.props;
    return (
      <div>
        <p>Profissão: {hover && hover.d && hover.d.profession}</p>
        {hover &&
          hover.d &&
          <div>
            <h3>
              Ranking por gênero e raça:
            </h3>
            {hover.d.ranking.map((d, i) => {
              return (
                <div key={i + 1}>
                  {i}: {d.profile} {brCurrency(d.salary)}
                </div>
              );
            })}
          </div>}

      </div>
    );
  }
}

export default Infobox;
