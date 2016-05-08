import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import { MachineStats } from '../../imports/api/machine_stats.js';


class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        {this.props.machineStats.length > 0 ? (
          <div>
            <div>current load, 1 min average: {this.props.machineStats[0].load_avg_1m}</div>
            <div>current load, 5 min average: {this.props.machineStats[0].load_avg_5m}</div>
            <div>current load, 15 min average: {this.props.machineStats[0].load_avg_15m}</div>
            <div>current load, date: {moment(this.props.machineStats[0].date).toString()}</div>
          </div>
        ) : null}
        <ul>
          {this.props.machineStats.map((stat) => (
            <li key={stat._id}>{JSON.stringify(stat)}</li>
          ))}
        </ul>
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
    machineStats: MachineStats.find({}, {sort: { date: -1 } }).fetch()
  };
}, App);
