const rawTheme = {
  palette: {
    background: {
      default: 'white',
    },
    primary: {
      light: '#494F5C',
      main: '#494F5C',
      dark: '#494F5C',
      contrastText: '#fff',
    },
    secondary: {
      light: '#CEC0A8',
      main: '#CEC0A8',
      dark: '#CEC0A8',
      contrastText: '#fff',
    },
    gray: {
      700: '#494F5C',
    },
  },
  typography: {
    useNextVariants: true,
    fontFamily: '\'Karla\', sans-serif',
    h2: {
      fontFamily: '\'Old Standard TT\', serif',
    },
    h3: {
      fontFamily: '\'Old Standard TT\', serif',
    },
    h4: {
      fontFamily: '\'Old Standard TT\', serif',
    },
    h5: {
      fontFamily: '\'Old Standard TT\', serif',
    },
    h6: {
      fontFamily: '\'Old Standard TT\', serif',
    },
    body1: {
      fontFamily: '\'Old Standard TT\', serif',
      fontSize: '1.2rem',
      paddingBottom: '1.5rem',
    },
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 0,
        textTransform: 'none',
      },
    },
  },
};

module.exports = rawTheme;
