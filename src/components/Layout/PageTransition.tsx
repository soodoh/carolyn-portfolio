import React, { ReactElement, ReactChildren } from 'react';
import { TransitionGroup, Transition as ReactTransition } from 'react-transition-group';

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

interface TransitionProps {
  location: { pathname: string };
  children: ReactChildren;
}

const PageTransition = (props: TransitionProps): ReactElement => {
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

export default PageTransition;
