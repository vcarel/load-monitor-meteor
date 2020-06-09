import React, { useRef, useEffect } from 'react'
import Highcharts from 'highcharts'
import moment from 'moment'

import { max_history_secs } from '../../imports/constants.js'

const HistoryChart = ({ sysStats }) => {
  const rootElRef = useRef(null)
  const chartRef = useRef(null)
  const prevSysStatsRef = useRef(sysStats)
  const threshold = sysStats[sysStats.length - 1]?.threshold

  // On mount
  useEffect(() => {
    if (!threshold) {
      return
    }

    const options = {
      chart: {
        type: 'areaspline'
      },
      title: {
        text: null
      },
      subtitle: {
        text: '1 min average'
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: null
        },
        min: moment().subtract(max_history_secs, 'seconds').toDate().getTime()
      },
      yAxis: {
        title: {
          text: null
        },
        min: 0
      },
      tooltip: {
        headerFormat: '<b>Load: {point.y:.2f}</b><br>',
        pointFormat: 'at {point.x: %H:%M:%S}'
      },
      plotOptions: {
        areaspline: {
          marker: {
            enabled: false
          },
          lineWidth: 2,
          color: '#e64759',
          fillOpacity: 0.25,
          states: {
            hover: {
              enabled: false
            }
          },
          softThreshold: true,
          zones: [
            {
              color: '#1ca8dd',
              value: 0.75 * threshold
            },
            {
              color: '#e4d836',
              value: threshold
            }
          ]
        }
      },
      legend: {
        enabled: false
      },
      series: [
        {
          name: 'Load',
          data: []
        }
      ]
    }
    chartRef.current = new Highcharts.Chart(rootElRef.current, options)

    return chartRef.current.destroy // cleanup
  }, [threshold])

  // On update
  useEffect(() => {
    if (!chartRef.current) {
      return
    }

    // Meteor does not send all the data at once
    // So the dataset grows quickly until it full. Then updates occur every 10 seconds
    // (or any other configured period)
    const serie = chartRef.current.series[0]
    const prevStats = prevSysStatsRef.current
    const stats = sysStats
    if (serie.data.length === 0 || stats.length - prevStats.length > 1) {
      // Still receiving vast amount of data: refreshing the whole dataset
      serie.setData(sysStats.map(stat => [stat.date.getTime(), stat.load_avg_1m]))
    } else {
      // Data completly received... updating points one by one
      const lastTime = prevStats[prevStats.length - 1].date.getTime()
      let i = sysStats.length
      while (sysStats[--i].date.getTime() > lastTime) {
        const stat = sysStats[i]
        serie.addPoint(
          [stat.date.getTime(), stat.load_avg_1m],
          false, // Do not redraw yet (otherwise updating range would break animation)
          stats.length === prevStats.length
        ) // If full, the new point will eject the last one
      }
    }
    chartRef.current.xAxis[0].update(
      { min: moment().subtract(max_history_secs, 'seconds').toDate().getTime() },
      false
    )
    chartRef.current.redraw()
  }, [sysStats])

  return <div ref={rootElRef} />
}

export default HistoryChart
