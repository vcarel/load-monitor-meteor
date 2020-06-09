import Fiber from 'fibers'
import { Meteor } from 'meteor/meteor'

import { refresh_period_secs } from '../imports/constants.js'
import { getNewStat, appendStat, checkAlarms } from './stats_service.js'

Meteor.startup(() => {
  // Update system stats every refresh_interval_millis
  setInterval(() => {
    Fiber(() => {
      appendStat(getNewStat())
      checkAlarms()
    }).run()
  }, refresh_period_secs * 1000)
})
