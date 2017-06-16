import React from "react";
import { object, array } from "prop-types";
import styled, { ThemeProvider, injectGlobal } from "styled-components";

/* eslint-disable no-unused-expressions */
injectGlobal`
  body {
    margin: 0;
    overflow: hidden;
  }
`;

const Root = styled.div`
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
  font: 11px sans-serif;
  padding: 8px;
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
