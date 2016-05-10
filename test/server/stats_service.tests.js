import moment from 'moment';
import os from 'os';
import { chai } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { max_history_secs } from '../../imports/constants.js';
import { SysStats } from '../../imports/api/sys_stats.js';
import { getNewStat, appendStat } from '../../server/stats_service.js';

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
});
