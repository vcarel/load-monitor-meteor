import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Cpus = new Mongo.Collection('cpus');

if (Meteor.isServer) {
  Meteor.publish('cpus', () => {
    return Cpus.find();
  });
}
