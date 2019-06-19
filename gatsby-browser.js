const { transitionDelay } = require('./src/components/Layout/PageTransition');

exports.shouldUpdateScroll = (params) => {
  const {
    routerProps: { location },
    getSavedScrollPosition,
  } = params;

  if (location.action === 'PUSH') {
    window.setTimeout(() => window.scrollTo(0, 0), transitionDelay);
  } else {
    const savedPosition = getSavedScrollPosition(location);
    window.setTimeout(
      () => window.scrollTo(...(savedPosition || [0, 0])),
      transitionDelay,
    );
  }
  return false;
};
