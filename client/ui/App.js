import moment from 'moment'
import React from 'react'
import { withTracker } from 'meteor/react-meteor-data'
import { Meteor } from 'meteor/meteor'

import { Events } from '../../imports/api/events.js'
import { SysStats } from '../../imports/api/sys_stats.js'
import { max_history_secs } from '../../imports/constants.js'
import Event from './Event'
import HistoryChart from './HistoryChart'
import StartCard from './StartCard'

const App = ({ events, sysStats }) => (
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
        {sysStats.length > 0 && (
          <div className='row statcards'>
            <StartCard period={1} sysStats={sysStats} />
            <StartCard period={5} sysStats={sysStats} />
            <StartCard period={15} sysStats={sysStats} />
          </div>
        )}
        <div className='hr-divider m-t-md m-b'>
          <h3 className='hr-divider-content hr-divider-heading'>Over the last 10 minutes</h3>
        </div>
        <HistoryChart sysStats={sysStats} />
      </div>
      <div className='col-md-4 col-lg-3 m-b'>
        <div className='list-group'>
          <h4 className='list-group-header'>
            Recent events
            {events.length > 0 && <span className='badge pull-right'>{events.length}</span>}
          </h4>
          {events.map(event => (
            <Event key={event._id} event={event} />
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default withTracker(({ id }) => {
  Meteor.subscribe('sys_stats', id)
  Meteor.subscribe('events', id)

  return {
    sysStats: SysStats.find(
      {
        // so to avoid getting a flat line in case of server long outage
        date: { $gte: moment().subtract(max_history_secs, 'seconds').toDate() }
      },
      {
        sort: { date: 1 }
      }
    ).fetch(),

    events: Events.find(
      {
        // *recent* events only
        date: { $gte: moment().subtract(max_history_secs, 'seconds').toDate() }
      },
      {
        sort: { date: -1 }
      }
    ).fetch()
  }
})(App)
