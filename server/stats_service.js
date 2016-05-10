import moment from 'moment';
import os from 'os';

import { max_history_secs } from '../imports/constants.js';
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

export function updateAlarms() {
}
