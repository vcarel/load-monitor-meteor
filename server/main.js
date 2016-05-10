import Fiber from 'fibers';
import { Meteor } from 'meteor/meteor';

import { refresh_period_secs } from '../imports/constants.js';
import { pushNewStats } from './sys_stats_service.js';

Meteor.startup(() => {
  // Update system stats every refresh_interval_millis
  setInterval(() => {
    Fiber(() => pushNewStats()).run();
  }, refresh_period_secs * 1000);
});
