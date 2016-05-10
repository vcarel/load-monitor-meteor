import moment from 'moment';
import os from 'os';
import { chai } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { max_history_secs } from '../../imports/constants.js';
import { Alarms } from '../../imports/api/alarms.js';
import { SysStats } from '../../imports/api/sys_stats.js';
import { getNewStat, appendStat, checkAlarms } from '../../server/stats_service.js';

chai.should();

describe('stats_service', function () {
  beforeEach(function () {
    resetDatabase();
  });

  describe('getNewStats', function () {
    beforeEach(function () {
      sinon.stub(os, 'loadavg').returns([10, 20, 30]);
      this.clock = sinon.useFakeTimers(Date.parse('2012-12-21T00:00:00.000Z'));
    });

    it('should return load averages and date', function () {
      const stat = getNewStat();
      stat.load_avg_1m.should.equal(10);
      stat.load_avg_5m.should.equal(20);
      stat.load_avg_15m.should.equal(30);
      stat.date.toISOString().should.equal((new Date()).toISOString());
    });

    afterEach(function() {
      os.loadavg.restore();
      this.clock.restore();
    });
  });

  describe('appendStat', function () {
    it('should insert provided stat', function () {
      appendStat({foo: 'bar'});
      SysStats
        .findOne({}, {fields: {_id: false}})
        .should.deep.equal({foo: 'bar'});
    });

    it('should trim old stats', function () {
      SysStats.insert({
        when: 'before threshold',
        date: moment().subtract(max_history_secs + 5, 'seconds').toDate()
      });
      SysStats.insert({
        when: 'after threshold',
        date: moment().subtract(max_history_secs - 5, 'seconds').toDate()
      });

      appendStat({when: 'now'});

      SysStats
        .find({}, {sort: {date: -1}})
        .map(stat => stat.when)
        .should.deep.equal(['after threshold', 'now']);
    });
  });

  describe('checkAlarms', function () {
    it('should activate load_avg_1m alarm when high-load average "t0" and "t0 - 1 min"', function () {
      SysStats.insert({
        date: moment().subtract(1, 'minutes').toDate(),
        load_avg_1m: 0.3
      });

      checkAlarms({
        date: new Date(),
        load_avg_1m: 1.7
      });

      Alarms
        .findOne({name: 'load_avg_1m'}, {fields: {_id: false, active: true}})
        .should.deep.equal({active: true});
    });

    it('should deactivate load_avg_1m alarm when low-load average at "t0" and "t0 - 1 min"', function () {
      Alarms.insert({name: 'load_avg_1m', active: true});
      SysStats.insert({
        date: moment().subtract(1, 'minutes').toDate(),
        load_avg_1m: 0.2
      });

      checkAlarms({
        date: new Date(),
        load_avg_1m: 1.7
      });

      Alarms
        .findOne({name: 'load_avg_1m'}, {fields: {_id: false, active: true}})
        .should.deep.equal({active: false});
    });

    it('should activate load_avg_1m alarm when double high-load at "t0" and no data at "t0 - 1 min"', function () {
      Alarms.insert({name: 'load_avg_1m', active: true});

      checkAlarms({
        date: new Date(),
        load_avg_1m: 2
      });

      Alarms
        .findOne({name: 'load_avg_1m'}, {fields: {_id: false, active: true}})
        .should.deep.equal({active: true});
    });
  });
});
