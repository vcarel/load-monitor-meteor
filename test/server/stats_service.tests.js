import moment from 'moment';
import os from 'os';
import chai from 'chai';
import sinon from 'sinon';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { max_history_secs } from '../../imports/constants.js';
import { Events } from '../../imports/api/events.js';
import { SysStats } from '../../imports/api/sys_stats.js';
import { getNewStat, appendStat, checkAlarms } from '../../server/stats_service.js';

const should = chai.should();

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
      stat.load_avg_2m.should.equal(10);  // expect same as load_avg_1m without anteriority
      stat.load_avg_5m.should.equal(20);
      stat.load_avg_15m.should.equal(30);
      stat.date.toISOString().should.equal((new Date()).toISOString());
    });

    it('should calculate load_avg_2m when anteriority', function () {
      SysStats.insert({
        load_avg_1m: 100,
        date: moment().subtract(1, 'm').toDate()
      });

      getNewStat().load_avg_2m.should.equal(55);
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
        date: moment().subtract(max_history_secs + 5, 's').toDate()
      });
      SysStats.insert({
        when: 'after threshold',
        date: moment().subtract(max_history_secs - 5, 's').toDate()
      });

      appendStat({when: 'now'});

      SysStats
        .find({}, {sort: {date: -1}})
        .map(stat => stat.when)
        .should.deep.equal(['after threshold', 'now']);
    });
  });

  describe('checkAlarms', function () {
    it('should trigger load_avg_2m alarm when high-load occuring without anteriority', function () {
      const now = new Date();
      SysStats.insert({load_avg_2m: 1, date: now});

      checkAlarms();

      const event = Events.findOne({}, {fields: {_id: false}});
      event.name.should.equal('high_load_avg_2m_begin');
      event.trigger_value.should.equal(1);
      event.date.toISOString().should.equal(now.toISOString());
    });

    it('should trigger load_avg_2m alarm when high-load occuring with anteriority', function () {
      const now = new Date();
      SysStats.insert({load_avg_2m: 0.9, date: moment().subtract(1, 's').toDate()});
      SysStats.insert({load_avg_2m: 1, date: now});

      checkAlarms();

      const event = Events.findOne({}, {fields: {_id: false}});
      event.name.should.equal('high_load_avg_2m_begin');
      event.trigger_value.should.equal(1);
      event.date.toISOString().should.equal(now.toISOString());
    });

    it('should cancel load_avg_2m alarm when high-load end', function () {
      const now = new Date();
      SysStats.insert({load_avg_2m: 1, date: moment().subtract(1, 's').toDate()});
      SysStats.insert({load_avg_2m: 0.9, date: now});

      checkAlarms();

      const event = Events.findOne({}, {fields: {_id: false}});
      event.name.should.equal('high_load_avg_2m_end');
      event.trigger_value.should.equal(0.9);
      event.date.toISOString().should.equal(now.toISOString());
    });

    it('should not cancel load_avg_2m alarm when no anteriority', function () {
      SysStats.insert({load_avg_2m: 0.9, date: new Date()});

      checkAlarms();

      should.not.exist(Events.findOne({}));
    });
  });
});
