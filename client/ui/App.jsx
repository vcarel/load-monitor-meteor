import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import { MachineStats } from '../../imports/api/machine_stats.js';
import HistoryChart from './HistoryChart.jsx';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const lastStat = this.props.machineStats.length > 0 ?
      this.props.machineStats[this.props.machineStats.length - 1] : null;
    return (
      <div className="container">
        <h1>Now</h1>
        {lastStat ? (
          <div>
            <div>current load, 1 min average: {lastStat.load_avg_1m}</div>
            <div>current load, 5 min average: {lastStat.load_avg_5m}</div>
            <div>current load, 15 min average: {lastStat.load_avg_15m}</div>
            <div>
              current load, date: {moment(this.props.machineStats[0].date).toString()}
            </div>
          </div>
        ) : null}

        <h1>History</h1>
        <HistoryChart machineStats={this.props.machineStats} />
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
