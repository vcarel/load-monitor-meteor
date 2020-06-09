import moment from 'moment'
import os from 'os'

import { max_history_secs } from '../imports/constants.js'
import { Events } from '../imports/api/events.js'
import { SysStats } from '../imports/api/sys_stats.js'

export function getNewStat() {
  const loadAvgs = os.loadavg()

  // Calculate load_avg_2m
  // Since load_avg_1m is already an average over 1 minute, we only need
  // the load 1 min ago to calculate the average over 2 minutes
  const now = new Date()
  const one_min_ago = moment(now).subtract(59, 'seconds').toDate()
  const previous_stat = SysStats.findOne({ date: { $lte: one_min_ago } }, { sort: { date: -1 } })
  const load_avg_2m =
    previous_stat === undefined ? loadAvgs[0] : (loadAvgs[0] + previous_stat.load_avg_1m) / 2

  return {
    load_avg_1m: loadAvgs[0],
    load_avg_2m: load_avg_2m,
    load_avg_5m: loadAvgs[1],
    load_avg_15m: loadAvgs[2],
    date: now
  }
}

export function appendStat(stat) {
  SysStats.insert(stat)
  SysStats.remove({
    date: { $lte: moment().subtract(max_history_secs, 'seconds').toDate() }
  })
}

export function checkAlarms() {
  const [stat_now, stat_before] = SysStats.find({}, { sort: { date: -1 }, limit: 2 }).fetch()
  if (stat_now.load_avg_2m >= 1 && (!stat_before || stat_before.load_avg_2m < 1)) {
    Events.insert({
      name: 'high_load_avg_2m_begin',
      trigger_value: stat_now.load_avg_2m,
      date: stat_now.date
    })
  } else if (stat_now.load_avg_2m < 1 && stat_before && stat_before.load_avg_2m >= 1) {
    Events.insert({
      name: 'high_load_avg_2m_end',
      trigger_value: stat_now.load_avg_2m,
      date: stat_now.date
    })
  }
}
