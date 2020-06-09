import moment from 'moment'
import React from 'react'

const Event = ({ event }) => {
  if (event.name === 'high_load_avg_2m_begin') {
    return (
      <div className='list-group-item' key={event.date}>
        <span className='text-muted p-r'>{moment(event.date).format('hh:mm:ss')}</span>
        High load (= {event.trigger_value.toFixed(2)})
        <span className='label label-danger pull-right'>alert</span>
      </div>
    )
  }

  if (event.name === 'high_load_avg_2m_end') {
    return (
      <div className='list-group-item' key={event.date}>
        <span className='text-muted p-r'>{moment(event.date).format('hh:mm:ss')}</span>
        End of high-load
        <span className='label label-success pull-right'>info</span>
      </div>
    )
  }
}

export default Event
