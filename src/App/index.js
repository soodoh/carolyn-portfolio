import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Header from './Header';
import Footer from './Footer';
import NotFound from './NotFound';
import Home from '../Home/index';
import About from '../About';
import Photography from '../Photography';
import Projects from '../Projects';
import Resume from '../Resume';

class App extends Component {
	componentWillMount() {
		// Remove default Browser margin
		document.body.style.margin = 0;
	}
	
	render() {
		const { classes } = this.props;
		
		return (
			<BrowserRouter>
				<div className={classes.container}>
					<Header />
					
					<section className={classes.content}>
						<Switch>
							<Route exact path='/' component={Home} />
							<Route path='/about' component={About} />
							<Route path='/photography' component={Photography} />
							<Route path='/projects' component={Projects} />
							<Route path='/resume' component={Resume} />
							<Route component={NotFound} />
						</Switch>
					</section>
					
					<Footer />
				</div>
			</BrowserRouter>
		);
	}
}

const styles = theme => ({
	container: {
		position: 'relative',
		minHeight: '100vh'
	},
	content: {
		padding: theme.spacing.unit * 2,
		paddingBottom: theme.spacing.unit * 11
	}
});

export default withStyles(styles)(App);
