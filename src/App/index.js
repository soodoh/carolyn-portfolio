import React  from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import Header from './Header';
import Footer from './Footer';
import NotFound from './NotFound';
import Home from '../Home';
import About from '../About';
import Photography from '../Photography';
import Projects from '../Projects';
import Resume from '../Resume';
import Theme from './Theme';
import './index.css';

// Necessary for Router props to be passed to Header
const ContentWrapper = Component => {
	const styles = theme => ({
		container: {
			position: 'relative',
			minHeight: '100vh',
			display: 'block'
		},
		content: {
			paddingBottom: theme.spacing.unit * 11
		}
	});
	
	const Content = props => (
		<div className={props.classes.container}>
			<Header match={props.match} />
			
			<section className={props.classes.content}>
				<Component />
			</section>
			
			<Footer />
		</div>
	);
	
	return withStyles(styles)(Content);
};

const App = props => (
	<MuiThemeProvider theme={Theme}>
		<BrowserRouter>
			<Switch>
				<Route exact path='/' component={ContentWrapper(Home)} />
				<Route path='/about' component={ContentWrapper(About)} />
				<Route path='/photography' component={ContentWrapper(Photography)} />
				<Route path='/projects' component={ContentWrapper(Projects)} />
				<Route path='/resume' component={ContentWrapper(Resume)} />
				<Route component={ContentWrapper(NotFound)} />
			</Switch>
		</BrowserRouter>
	</MuiThemeProvider>
);
export default App;