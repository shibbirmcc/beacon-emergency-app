import React from 'react';
import { GHContext } from '../native-stack/contexts/GHContext';
import ScreenGestureDetector from './ScreenGestureDetector';
function GHWrapper(props) {
  return /*#__PURE__*/React.createElement(ScreenGestureDetector, props);
}
export default function GestureDetectorProvider(props) {
  return /*#__PURE__*/React.createElement(GHContext.Provider, {
    value: GHWrapper
  }, props.children);
}
//# sourceMappingURL=GestureDetectorProvider.js.map