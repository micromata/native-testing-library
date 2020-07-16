import React from 'react';

import { mockNativeMethods } from './mock-native-methods';

function mockComponent(path, { instanceMethods, displayName: customDisplayName } = {}) {
  const RealComponent = jest.requireActual(path);

  const displayName =
    customDisplayName ||
    RealComponent.displayName ||
    RealComponent.name ||
    (RealComponent.render // handle React.forwardRef
      ? RealComponent.render.displayName || RealComponent.render.name
      : 'Unknown');

  const SuperClass = typeof RealComponent === 'function' ? RealComponent : React.Component;

  class Component extends SuperClass {
    static displayName = displayName;

    render() {
      const props = Object.assign({}, RealComponent.defaultProps);
      if (this.props) {
        Object.keys(this.props).forEach(prop => {
          // We can't just assign props on top of defaultProps
          // because React treats undefined as special and different from null.
          // If a prop is specified but set to undefined it is ignored and the
          // default prop is used instead. If it is set to null, then the
          // null value overwrites the default value.
          if (this.props[prop] !== undefined) {
            props[prop] = this.props[prop];
          }
        });
      }

      return React.createElement(displayName, props, this.props.children);
    }
  }

  Object.keys(RealComponent).forEach(classStatic => {
    Component[classStatic] = RealComponent[classStatic];
  });

  Object.assign(Component.prototype, mockNativeMethods);

  if (instanceMethods != null) {
    Object.assign(Component.prototype, instanceMethods);
  }

  return Component;
}

export { mockComponent };
