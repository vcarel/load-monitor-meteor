import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import Highcharts from 'highcharts';

import App from './ui/App.jsx';

Highcharts.setOptions({
	global: {
		useUTC: false
	}
});

Meteor.startup(() => {
  render(<App />, document.getElementById('render-target'));
});
