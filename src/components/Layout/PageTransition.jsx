import React from 'react';
import PropTypes from 'prop-types';
import {
  TransitionGroup,
  Transition as ReactTransition,
} from 'react-transition-group';

export const transitionDelay = 500;

const getTransitionStyles = {
  entering: {
    position: 'absolute',
    opacity: 0,
  },
  entered: {
    transition: `opacity ${transitionDelay}ms ease-in-out`,
    opacity: 1,
  },
  exiting: {
    transition: `opacity ${transitionDelay}ms ease-in-out`,
    opacity: 0,
  },
};

const PageTransition = (props) => {
  const { children, location } = props;

  return (
    <TransitionGroup>
      <ReactTransition
        key={location.pathname}
        timeout={{
          enter: transitionDelay,
          exit: transitionDelay,
        }}
      >
        {status => (
          <div
            style={{
              ...getTransitionStyles[status],
            }}
          >
            {children}
          </div>
        )}
      </ReactTransition>
    </TransitionGroup>
  );
};

PageTransition.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default PageTransition;
