import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

export const SysStats = new Mongo.Collection('sys_stats')

if (Meteor.isServer) {
  SysStats._ensureIndex({ date: 1 })

  Meteor.publish('sys_stats', () => {
    return SysStats.find()
  })
}
