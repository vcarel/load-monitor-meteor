import { resetDatabase } from 'meteor/xolvio:cleaner';
import { chai } from 'meteor/practicalmeteor:chai';

chai.should();

describe('sys_stats_service', function () {
  describe('my_method_to_test', function () {
    beforeEach(function () {
      resetDatabase();
    });

    it('does something that should be tested', function () {
      (true).should.be.true;
    });
  });
});
