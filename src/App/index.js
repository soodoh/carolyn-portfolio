import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import Header from './Header';
import Footer from './Footer';
import NotFound from './NotFound';
import Home from '../Home/index';
import About from '../About';
import Photography from '../Photography';
import Projects from '../Projects';
import Resume from '../Resume';
import Theme from './Theme';

// Necessary for Router props to be passed to Header
const ContentWrapper = Component => {
	const Content = props => (
		<div>
			<Header match={props.match} />
			<Component />
			<Footer />
		</div>
	);
	
	return Content;
};

class App extends Component {
	componentWillMount() {
		// Remove default Browser margin
		document.body.style.margin = 0;
	}
	
	render() {
		const { classes } = this.props;
		
		return (
			<MuiThemeProvider theme={Theme}>
				<BrowserRouter>
					<div className={classes.container}>
						<section className={classes.content}>
							<Switch>
								<Route exact path='/' component={ContentWrapper(Home)} />
								<Route path='/about' component={ContentWrapper(About)} />
								<Route path='/photography' component={ContentWrapper(Photography)} />
								<Route path='/projects' component={ContentWrapper(Projects)} />
								<Route path='/resume' component={ContentWrapper(Resume)} />
								<Route component={ContentWrapper(NotFound)} />
							</Switch>
						</section>
					</div>
				</BrowserRouter>
			</MuiThemeProvider>
		);
	}
}

const styles = theme => ({
	container: {
		position: 'relative',
		minHeight: '100vh'
	},
	content: {
		paddingBottom: theme.spacing.unit * 11
	}
});

export default withStyles(styles)(App);
