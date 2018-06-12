import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

class ModalBase extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = { projectActive: false };
		this.toggle = this.toggle.bind(this);
	}
	
	toggle() {
		this.setState({ projectActive: !this.state.projectActive });
	}
	
	render() {
		const { classes, data } = this.props;
		
		return (
			<div className={classes.projectContainer}>
				<img src={`${data.fields.coverImage.fields.file.url}?w=400`}
				     alt={data.fields.coverImage.fields.title}
				     className={classes.photo}
				     onClick={this.toggle}
				/>
				
				<Dialog open={this.state.projectActive}
				        onClose={this.toggle}
				>
					<DialogTitle>Test</DialogTitle>
					<DialogContent>Test</DialogContent>
				</Dialog>
			</div>
		);
	}
}

const styles = theme => ({
	photo: {
		padding: theme.spacing.unit * 2,
		width: `calc(100% - ${theme.spacing.unit * 4}px)`,
		cursor: 'pointer',
		verticalAlign: 'top' // Removes bottom gutter for Masonry
	},
	// Breakpoints
	[`@media (min-width: ${theme.breakpoints.values.xs}px)`]: {
		projectContainer: {
			width: '50%'
		}
	},
	[`@media (min-width: ${theme.breakpoints.values.md}px)`]: {
		projectContainer: {
			width: '33.33%'
		}
	},
	[`@media (min-width: ${theme.breakpoints.values.lg}px)`]: {
		projectContainer: {
			width: '25%'
		}
	}
});

export default withStyles(styles)(ModalBase);