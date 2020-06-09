import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import { Meteor } from 'meteor/meteor'

import { Events } from '../../imports/api/events.js'
import { SysStats } from '../../imports/api/sys_stats.js'
import { max_history_secs } from '../../imports/constants.js'
import HistoryChart from './HistoryChart.jsx'

class App extends Component {
  render() {
    return (
      <div className='container-fluid container-fluid-spacious'>
        <div className='dashhead'>
          <div className='dashhead-titles'>
            <h6 className='dashhead-subtitle'>A sample meteor.js app with highcharts</h6>
            <h2 className='dashhead-title'>System load</h2>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-8 col-lg-9 m-b'>
            <div className='hr-divider m-t-md m-b'>
              <h3 className='hr-divider-content hr-divider-heading'>Quick stats</h3>
            </div>
            {this.props.sysStats.length > 0 ? (
              <div className='row statcards'>
                {this.getStatCardElement(1)}
                {this.getStatCardElement(5)}
                {this.getStatCardElement(15)}
              </div>
            ) : null}
            <div className='hr-divider m-t-md m-b'>
              <h3 className='hr-divider-content hr-divider-heading'>Over the last 10 minutes</h3>
            </div>
            <HistoryChart sysStats={this.props.sysStats} />
          </div>
          <div className='col-md-4 col-lg-3 m-b'>{this.getEventsElement()}</div>
        </div>
      </div>
    )
  }

  getStatCardElement(period) {
    const stat = this.props.sysStats[this.props.sysStats.length - 1]
    const load = stat['load_avg_' + period + 'm']

    // Calculate progress rate
    let progressRate = 0
    if (this.props.sysStats.length > 1) {
      const beforeStat = this.props.sysStats[this.props.sysStats.length - 2]
      const beforeLoad = beforeStat['load_avg_' + period + 'm']
      progressRate = (load - beforeLoad) / beforeLoad
    }

    const title_by_period = {
      1: 'last minute',
      5: 'last 5 minutes',
      15: 'last 15 minutes'
    }

    return (
      <div className='col-sm-4 m-b'>
        <div
          className={
            'statcard ' +
            (load >= 1 ? 'statcard-danger' : load >= 0.75 ? 'statcard-warning' : 'statcard-success')
          }
        >
          <div className='p-a'>
            <span className='statcard-desc'>{title_by_period[period]}</span>
            <h2 className='statcard-number'>
              {load.toFixed(2)}
              {Math.round(progressRate * 100) !== 0 ? (
                <small
                  className={
                    'delta-indicator ' + (progressRate > 0 ? 'delta-positive' : 'delta-negative')
                  }
                >
                  {(progressRate * 100).toFixed(0)}%
                </small>
              ) : null}
            </h2>
          </div>
        </div>
      </div>
    )
  }

  getEventsElement() {
    return (
      <div className='list-group'>
        <h4 className='list-group-header'>
          Recent events
          {this.props.events.length > 0 ? (
            <span className='badge pull-right'>{this.props.events.length}</span>
          ) : null}
        </h4>
        {this.props.events.map(this.getEventElement)}
      </div>
    )
  }

  getEventElement(event) {
    if (event.name === 'high_load_avg_2m_begin') {
      return (
        <div className='list-group-item' key={event.date}>
          <span className='text-muted p-r'>{moment(event.date).format('hh:mm:ss')}</span>
          High load (= {event.trigger_value.toFixed(2)})
          <span className='label label-danger pull-right'>alert</span>
        </div>
      )
    } else if (event.name === 'high_load_avg_2m_end') {
      return (
        <div className='list-group-item' key={event.date}>
          <span className='text-muted p-r'>{moment(event.date).format('hh:mm:ss')}</span>
          End of high-load
          <span className='label label-success pull-right'>info</span>
        </div>
      )
    }
  }
}

App.propTypes = {
  sysStats: PropTypes.array.isRequired,
  events: PropTypes.array.isRequired
}

export default createContainer(() => {
  Meteor.subscribe('sys_stats')
  Meteor.subscribe('events')

  return {
    sysStats: SysStats.find(
      {
        date: { $gte: moment().subtract(max_history_secs, 'seconds').toDate() } // so to avoid getting a flat line in case of server long outage
      },
      {
        sort: { date: 1 }
      }
    ).fetch(),

    events: Events.find(
      {
        date: { $gte: moment().subtract(max_history_secs, 'seconds').toDate() } // *recent* events only
      },
      {
        sort: { date: -1 }
      }
    ).fetch()
  }
}, App)
