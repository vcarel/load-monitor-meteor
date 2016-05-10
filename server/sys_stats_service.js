import moment from 'moment';
import os from 'os';

import { max_history_secs } from '../imports/constants.js';
import { SysStats } from '../imports/api/sys_stats.js';

export function pushNewStats() {
  const loadAvgs = os.loadavg();

  SysStats.insert({
    load_avg_1m: loadAvgs[0],
    load_avg_5m: loadAvgs[1],
    load_avg_15m: loadAvgs[2],
    date: new Date()
  });

  SysStats.remove({
    date: {$lte: moment().subtract(max_history_secs, 'seconds').toDate()}
  });
}
