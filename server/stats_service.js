import moment from 'moment';
import os from 'os';

import { max_history_secs } from '../imports/constants.js';
import { Alarms } from '../imports/api/alarms.js';
import { SysStats } from '../imports/api/sys_stats.js';

export function getNewStat() {
  const loadAvgs = os.loadavg();

  return {
    load_avg_1m: loadAvgs[0],
    load_avg_5m: loadAvgs[1],
    load_avg_15m: loadAvgs[2],
    date: new Date()
  };
}

export function appendStat(stat) {
  SysStats.insert(stat);
  SysStats.remove({
    date: {$lte: moment().subtract(max_history_secs, 'seconds').toDate()}
  });
}

export function checkAlarms(t0_stat) {
  // We want to trigger alert when load_avg_1m is over 1 during two minutes
  // But load_avg_1m is already an average on 1 minutes.
  // So we need the loads at t0 and t0 - 1 min to cover a two-minutes period
  // [t0, t0 - 1 min, t0 - 2 min]
  const t0_minus_1m_stat = SysStats.findOne({
    date: {$lte: moment(t0_stat.date).subtract(59, 'seconds').toDate()}
  }, {
    sort: {date: -1}
  }) || {
    load_avg_1m: 0
  };

  // const active = t0_minus_1m_stat ? t0_stat.load_avg_1m + t0_minus_1m_stat.load_avg_1m : false;
  const load_avg_2m = (t0_stat.load_avg_1m + t0_minus_1m_stat.load_avg_1m) / 2;
  Alarms.upsert({name: 'load_avg_1m'}, {$set: {active: load_avg_2m >= 1}});
}
