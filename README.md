[![Build Status](https://travis-ci.org/vcarel/load-monitor-meteor.svg?branch=master)](https://travis-ci.org/vcarel/load-monitor-meteor)

# load-monitor-meteor

A sample [meteor.js](https://www.meteor.com) app with [highcharts](http://www.highcharts.com).

## Demo

The application is available at Heroku (on a single dyno):
https://load-monitor-meteor.herokuapp.com/

Mind that this application raises alarms at a load of 1. It's a is just a demo app... In real life, we would raise an alarm when the load goes beyond the number of CPU cores.

## Install

Clone this repository, then:

```bash
$ yarn install
```

Note that Meteor install its own version of node. However, the install has been tested only against modern versions of node (>= 4.2.0).

## A few commands

- Run the application

```bash
$ yarn start
```

- Run tests

```bash
$ yarn test
```

- Run tests and watch files for changes

```bash
$ yarn run test:watch
```
