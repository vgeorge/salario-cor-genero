import React, { Component } from "react";
import SelectSearch from "react-select";
import styled from "styled-components";
import "react-select/dist/react-select.css";

const Wrapper = styled.div`
  position: relative;
  z-index: 10;
  background: #000;
  color: #fff;
  margin: 0 -30px;
  padding: 10px 30px;
  .search-container {
    position: relative;
  }
  input[type=search] {
    width: 100%;
    padding: 1rem 0;
    font-size: 1.2em;
    border: 0;
    font-weight: 600;
    background: transparent;
    color: #fff;
  }
  input[type=search]:focus {
    outline: none;
  }
  .select-search-box__select {
    display: none;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 58px;
    background: #fff;
    max-height: 200px !important;
    overflow: auto;
    border: 1px solid #f0f0f0;
    color: #333;
  }
  .select-search-box__select--display {
    display: block;
  }
  .select-search-box__options {
    list-style: none;
    margin: 0;
    padding: 0;
    .select-search-box__option {
      margin: 0;
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
    }
    .select-search-box__option--hover, .select-search-box__option:hover {
      background: #f0f0f0;
    }
    .select-search-box__option--selected {
      background: #ccc;
    }
  }
`;

const InfoBox = styled.div`
`;

class SearchBox extends SelectSearch {
  constructor(props) {
    super(props);
    this.professions = [];
  }

  render() {
    var { data, focusedItem } = this.props;

    // Load professions if not already
    if (this.professions.length == 0 && data && data.series) {
      this.professions = data.series.map(function(d, i) {
        return { name: d.profession, value: i };
      });
      // .sort(function(a, b) {
      //   return a.name > b.name;
      // });
    }

    // console.log(JSON.parse(JSON.stringify(focusedItem));

    return (
      <Wrapper>
        <div className="search-container">
          <SelectSearch
            options={this.professions}
            value={focusedItem}
            name="profession"
            placeholder="Busque uma profissão"
          />
        </div>
        {/* <InfoBox>
          <p>Test</p>
        </InfoBox> */}
      </Wrapper>
    );
  }
}

export default SearchBox;
