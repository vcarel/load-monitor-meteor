import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import { MachineStats } from '../../imports/api/machine_stats.js';
import HistoryChart from './HistoryChart.jsx';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="container">
        <div className="dashhead">
          <div className="dashhead-titles">
              <h6 className="dashhead-subtitle">A sample meteor.js app with highcharts</h6>
              <h2 className="dashhead-title">System Load</h2>
            </div>
        </div>
        <div className="hr-divider m-t-md m-b">
          <h3 className="hr-divider-content hr-divider-heading">Quick stats</h3>
        </div>
        {this.props.machineStats.length > 0 ? (
          <div className="row statcards">
            {this.getStatCardElement(1)}
            {this.getStatCardElement(5)}
            {this.getStatCardElement(15)}
          </div>
        ) : null}
        <div className="hr-divider m-t-md m-b">
          <h3 className="hr-divider-content hr-divider-heading">Over the last 10 minutes</h3>
        </div>
        <HistoryChart machineStats={this.props.machineStats} />
      </div>
    );
  }

  getStatCardElement(period) {
    const stat = this.props.machineStats[this.props.machineStats.length - 1];
    const load = stat['load_avg_' + period + 'm'];

    // Calculate progress rate
    let progressRate = 0;
    if (this.props.machineStats.length > 1) {
      const beforeStat = this.props.machineStats[this.props.machineStats.length - 2];
      const beforeLoad = beforeStat['load_avg_' + period + 'm'];
      progressRate = (load - beforeLoad) / beforeLoad;
    }

    const title_by_period = {
      1: 'last minute',
      5: 'last 5 minutes',
      15: 'last 15 minutes'
    };

    return (
      <div className="col-sm-4 m-b">
        <div className={
            'statcard ' + (load >= 1 ? 'statcard-danger' :
            load >= 0.8 ? 'statcard-warning' : 'statcard-success')}>
          <div className="p-a">
            <span className="statcard-desc">{title_by_period[period]}</span>
            <h2 className="statcard-number">
              {load.toFixed(2)}
              {Math.round(progressRate * 100) !== 0 ? (
                <small className={'delta-indicator ' + (progressRate > 0 ?
                    'delta-positive' : 'delta-negative')}>
                  {(progressRate * 100).toFixed(0)}%
                </small>
              ) : null }
            </h2>
          </div>
        </div>
      </div>
    );
  }
}

App.propTypes = {
  machineStats: PropTypes.array.isRequired
};

export default createContainer(() => {
  Meteor.subscribe('machine_stats');

  return {
    machineStats: MachineStats.find({}, {sort: { date: 1 } }).fetch()
  };
}, App);
