import React from "react";
import { object, array } from "prop-types";
import styled, { ThemeProvider, injectGlobal } from "styled-components";

/* eslint-disable no-unused-expressions */
injectGlobal`
  body {
    margin: 0;
    overflow: hidden;
    background-color: ${({ theme }) => theme.background};
  }
`;

const Root = styled.div`
  color: ${({ theme }) => theme.color};
  font-family: Merriweather sans, sans-serif;
  padding: 10px;
`;

const ThemedApp = ({ theme, children }) =>
  <ThemeProvider theme={theme}>
    <Root>
      {children}
    </Root>
  </ThemeProvider>;

ThemedApp.propTypes = {
  theme: object,
  children: array
};

export default ThemedApp;
