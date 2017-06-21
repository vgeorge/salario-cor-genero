import React, { Component } from "react";
import { render } from "react-dom";
import styled from "styled-components";

import brCurrency from "../helpers/brCurrency";

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

class Infobox extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { hover } = this.props;
    return (
      <Wrapper>
        <p>Saiba mais na reportagem: "Título da Reportagem"</p>
      </Wrapper>
    );
  }
}

export default Infobox;
