import _ from 'underscore';
import Fiber from 'fibers';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import os from 'os';

import { Cpus } from '../imports/api/cpus.js';
import { MachineStats } from '../imports/api/machine_stats.js';

const refresh_interval_millis = 10 * 1000;  // 10 seconds
const max_history_secs = 10 * 60;           // 10 minutes

Meteor.startup(() => {
  // Update CPU data once for all
  Cpus.remove({});
  os.cpus()
    .map(cpu => _.pick(cpu, 'model'))
    .forEach(cpu => {
      Cpus.insert(cpu);
    });

  // Update machine stats every refresh_interval_millis
  fiberAppendMachineStat.run();
  setInterval(() => {
    fiberAppendMachineStat.run();
  }, refresh_interval_millis);
});

const fiberAppendMachineStat = Fiber(() => {
  const loadAvgs = os.loadavg();
  MachineStats.insert({
    load_avg_1m: loadAvgs[0],
    load_avg_5m: loadAvgs[1],
    load_avg_15m: loadAvgs[2],
    date: new Date()
  });
  MachineStats.remove({
    date: {$lte: moment().subtract(max_history_secs, 'seconds').toDate()}
  });
});
