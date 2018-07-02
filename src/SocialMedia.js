import React from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import SVG from 'react-inlinesvg';
import Keys from './keys';

class SocialMedia extends React.Component {
	constructor(props) {
		super(props);
		
		const Contentful = require('contentful');
		this.client = Contentful.createClient(Keys);
		this.state = { icons: [] };
	}
	
	componentDidMount() {
		this.client.getEntries({ content_type: 'socialMedia' }).then(res => {
			this.setState({
				icons: res.items
			});
		});
	}
	
	render() {
		const { classes, theme, color } = this.props;
		const colorCode = color ? theme.palette[color].main : theme.palette.gray[700];
		
		return (
			<div className={classes.container}>
				{this.state.icons.map((icon, index) => (
					<a href={icon.fields.link}
					   style={{ color: 'inherit' }}
					   key={index}
					>
						<IconButton color={color || 'inherit'}>
							<SVG src={icon.fields.icon.fields.file.url}
							     style={{ fill: colorCode }}
							/>
						</IconButton>
					</a>
				))}
			</div>
		);
	}
}

const styles = {
	container: {
		display: 'flex',
		justifyContent: 'center'
	}
};

export default withTheme()(withStyles(styles)(SocialMedia));