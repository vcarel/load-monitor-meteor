import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Alarms = new Mongo.Collection('alarms');

if (Meteor.isServer) {
  Meteor.publish('alarms', () => {
    return Alarms.find();
  });
}
