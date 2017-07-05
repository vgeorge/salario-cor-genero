/**
 * WindowResizeListener: React component for listening to window resize events
 *
 * ref: https://github.com/cesarandreu/react-window-resize-listener
 */

import React, { Component } from "react";
import { debounce } from "lodash";

class WindowResizeListener extends Component {
  constructor(props) {
    super(props);

    this.displayName = "WindowResizeListener";
    this._listeners = [];
    this.DEBOUNCE_TIME = 100;

    this._onResize = this._onResize.bind(this);
  }

  _onResize() {
    var windowWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    var windowHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;

    this._listeners.forEach(function(listener) {
      listener({
        windowWidth: windowWidth,
        windowHeight: windowHeight
      });
    });
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.onResize !== this.props.onResize;
  }

  componentDidMount() {
    // Defer creating _debouncedResize until it's mounted
    // This allows users to change DEBOUNCE_TIME if they want
    // If there's no listeners, we need to attach the window listener
    if (!this._listeners.length) {
      this._debouncedResize = debounce(this._onResize, this.DEBOUNCE_TIME);
      window.addEventListener("resize", this._debouncedResize, false);
    }
    this._listeners.push(this.props.onResize);
    this._debouncedResize();
  }

  componentWillUnmount() {
    var idx = this._listeners.indexOf(this.props.onResize);
    this._listeners.splice(idx, 1);
    if (!this._listeners.length) {
      window.removeEventListener("resize", this._debouncedResize, false);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.onResize !== this.props.onResize) {
      var idx = this._listeners.indexOf(this.props.onResize);
      this._listeners.splice(idx, 1, nextProps.onResize);
    }
  }

  render() {
    return null;
  }
}

export default WindowResizeListener;
