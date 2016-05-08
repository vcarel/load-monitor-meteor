import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const MachineStats = new Mongo.Collection('machine_stats');

if (Meteor.isServer) {
  MachineStats._ensureIndex({date: 1});

  Meteor.publish('machine_stats', () => {
    return MachineStats.find();
  });
}
