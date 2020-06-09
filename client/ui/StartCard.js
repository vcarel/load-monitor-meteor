import React from 'react'

const StartCard = ({ period, sysStats }) => {
  const stat = sysStats[sysStats.length - 1]
  const load = stat['load_avg_' + period + 'm']

  // Calculate progress rate
  let progressRate = 0
  if (sysStats.length > 1) {
    const beforeStat = sysStats[sysStats.length - 2]
    const beforeLoad = beforeStat['load_avg_' + period + 'm']
    progressRate = (load - beforeLoad) / beforeLoad
  }

  const title_by_period = {
    1: 'last minute',
    5: 'last 5 minutes',
    15: 'last 15 minutes'
  }

  return (
    <div className='col-sm-4 m-b'>
      <div
        className={
          'statcard ' +
          (load >= 1 ? 'statcard-danger' : load >= 0.75 ? 'statcard-warning' : 'statcard-success')
        }
      >
        <div className='p-a'>
          <span className='statcard-desc'>{title_by_period[period]}</span>
          <h2 className='statcard-number'>
            {load.toFixed(2)}
            {Math.round(progressRate * 100) !== 0 ? (
              <small
                className={
                  'delta-indicator ' + (progressRate > 0 ? 'delta-positive' : 'delta-negative')
                }
              >
                {(progressRate * 100).toFixed(0)}%
              </small>
            ) : null}
          </h2>
        </div>
      </div>
    </div>
  )
}

export default StartCard
