import React, { Component, PropTypes } from 'react';
import Highcharts from 'highcharts';


export default class HistoryChart extends Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    const stats = this.props.machineStats;
    const nextStats = nextProps.machineStats;
    return nextStats.length !== stats.length ||
      nextStats[nextStats.length - 1].date !== stats[stats.length - 1].date;
  }

  componentDidMount() {
    const options = {
        chart: {
            type: 'spline'
        },
        title: {
            text: 'System load'
        },
        subtitle: {
            text: '1 min average'
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Date'
            }
        },
        yAxis: {
            title: {
                text: 'Load'
            },
            min: 0
        },
        tooltip: {
            headerFormat: '<b>Load: {point.y:.2f}</b><br>',
            pointFormat: 'at {point.x: %H:%M:%S}'
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: false
                },
                lineWidth: 4
            }
        },

        series: [{
            name: 'Load',
            data: [
            ],
            states: {
              hover: {
                enabled: false
              }
            }
        }]
    };
    this.chart = new Highcharts.Chart(this.refs.main, options);
  }

  componentDidUpdate (prevProps) {
    // Meteor does not send all the data at once
    // So the dataset grows quickly until it full. Then updates occur ever 10 seconds
    const serie = this.chart.series[0];
    const prevStats = prevProps.machineStats;
    const stats = this.props.machineStats;
    if (serie.data.length === 0 || (stats.length - prevStats.length) > 1) {
      // Still receiving vast amount of data: refreshing the whole dataset
      serie.setData(
        this.props.machineStats.map(stat => [stat.date.getTime(), stat.load_avg_1m])
      );
    } else {
      // Dataset is full... updating points one by one
      const lastTime = prevStats[prevStats.length -1].date.getTime();
      let i = this.props.machineStats.length;
      while (this.props.machineStats[--i].date.getTime() > lastTime) {
        const stat = this.props.machineStats[i];
        serie.addPoint(
          [stat.date.getTime(), stat.load_avg_1m],
          true,
          stats.length === prevStats.length);
      }
    }


    // this.props.machineStats.forEach(stat => {
    //   this.chart.series[0].addPoint([stat.date.getTime(), stat.load_avg_1m]);
    // });
  }

  componentWillUnmount () {
    this.chart.destroy();
  }

  render() {
    return (
      <div ref='main'>TODO</div>
    );
  }


}

HistoryChart.propTypes = {
  machineStats: PropTypes.array.isRequired
};
