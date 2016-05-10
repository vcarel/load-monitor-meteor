import React, { Component, PropTypes } from 'react';
import Highcharts from 'highcharts';
import moment from 'moment';

import { max_history_secs } from '../../imports/constants.js';

export default class HistoryChart extends Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    const stats = this.props.sysStats;
    const nextStats = nextProps.sysStats;
    return nextStats.length !== stats.length ||
      nextStats[nextStats.length - 1].date !== stats[stats.length - 1].date;
  }

  componentDidMount() {
    const options = {
      chart: {
        type: 'areaspline'
      },
      title: {
        text: null
      },
      subtitle: {
        text: '1 min average'
      },
      xAxis: {
        type: 'datetime',
        title: {
            text: null
        },
        min: moment().subtract(max_history_secs, 'seconds').toDate().getTime()
      },
      yAxis: {
        title: {
            text: null
        },
        min: 0
      },
      tooltip: {
        headerFormat: '<b>Load: {point.y:.2f}</b><br>',
        pointFormat: 'at {point.x: %H:%M:%S}'
      },
      plotOptions: {
        areaspline: {
          marker: {
              enabled: false
          },
          lineWidth: 2,
          color: '#e64759',
          fillOpacity: 0.25,
          states: {
            hover: {
              enabled: false
            }
          },
          softThreshold: true,
          zones: [{
            color: '#1ca8dd',
            value: 0.75
          }, {
            color: '#e4d836',
            value: 1
          }]
        }
      },
      legend: {
        enabled: false
      },
      series: [{
        name: 'Load',
        data: [
        ]
      }]
    };
    this.chart = new Highcharts.Chart(this.refs.main, options);
  }

  componentDidUpdate (prevProps) {
    // Meteor does not send all the data at once
    // So the dataset grows quickly until it full. Then updates occur every 10 seconds
    // (or any other configured period)
    const serie = this.chart.series[0];
    const prevStats = prevProps.sysStats;
    const stats = this.props.sysStats;
    if (serie.data.length === 0 || (stats.length - prevStats.length) > 1) {
      // Still receiving vast amount of data: refreshing the whole dataset
      serie.setData( this.props.sysStats.map(stat => [stat.date.getTime(), stat.load_avg_1m])
      );
    } else {
      // Data completly received... updating points one by one
      const lastTime = prevStats[prevStats.length -1].date.getTime();
      let i = this.props.sysStats.length;
      while (this.props.sysStats[--i].date.getTime() > lastTime) {
        const stat = this.props.sysStats[i];
        serie.addPoint(
          [stat.date.getTime(), stat.load_avg_1m],
          false,  // Do not redraw yet (otherwise updating range would break animation)
          stats.length === prevStats.length);  // If full, the new point will eject the last one
      }
    }
    this.chart.xAxis[0].update({
      min: moment().subtract(max_history_secs, 'seconds').toDate().getTime()
    }, false);
    this.chart.redraw();
  }

  componentWillUnmount () {
    this.chart.destroy();
  }

  render() {
    return (
      <div ref='main' />
    );
  }
}

HistoryChart.propTypes = {
  sysStats: PropTypes.array.isRequired
};
