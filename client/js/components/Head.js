import { debounce } from "lodash";
import React, { Component } from "react";
import format from "../helpers/br-format";
import config from "../config";
import SearchBox from "./SearchBox";

class Head extends Component {
  constructor(props) {
    super(props);

    this.getHeight = this.props.getHeight;
    this._onResize = this._onResize.bind(this);
  }

  componentDidMount() {
    this._debouncedResize = debounce(this._onResize, config.debounceTime);
    window.addEventListener("resize", this._debouncedResize, false);
    setTimeout(() => {
      this._onResize();
    }, 200);
  }

  _onResize() {
    const { wrapperDiv } = this;
    if (wrapperDiv) {
      this.getHeight(wrapperDiv.clientHeight);
    }
  }

  render() {
    const { data, selectedProfession, _onSearchBoxChange, frozen } = this.props;

    return (
      <div
        ref={element => {
          if (element) this.wrapperDiv = element;
        }}
        style={{ textAlign: "center" }}
      >
        <h1>Qual a diferença salarial?</h1>

        {data.series && [
          <p>
            Homens ganharam salários maiores em{" "}
            {format.percent(
              data.professionsWomanEarnLess / data.numberOfProfessions
            )}{" "}
            das carreiras em 2016.
          </p>,
          <SearchBox
            data={data}
            selectedProfession={selectedProfession}
            frozen={frozen}
            onChange={_onSearchBoxChange}
          />
        ]}
      </div>
    );
  }
}

export default Head;
