import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

const CalendarWidget = () => {
  const reactCalendar = () => {
    type ValuePiece = Date | null
    type Value = ValuePiece | [ValuePiece, ValuePiece]
    const [value, onChange] = useState<Value>(new Date())
    return (
      <div>
        <Calendar onChange={onChange} value={value} />
        <h1 id="date-value">{formatDate(value)}</h1>
      </div>
    )
  }

  const formatDate = (value) => {
    const date = new Date(value)
    date.setDate(date.getDate() + 1)
    const year = date.getUTCFullYear()
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    const day = date.getUTCDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  return (
    <div>
      <br></br>
      {reactCalendar()}
    </div>
  )
}

export default CalendarWidget
