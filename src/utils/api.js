import dayjs from 'dayjs'
import axios from './axios'

export const getSendings = isAir => async () => {
  const response = await axios.postWithAuth('/query/select', { sql: `SELECT * FROM trip WHERE \`to\`='${Number(isAir)}'` })
  const data = response.data?.data || []
  return data.map(item => {
    let json
    try {
      json = JSON.parse(item.json.replaceAll("\n", ''))
    } catch (e) {
      console.warn(e)
      json = {}
    }

    return {
      id: item.id_trip,
      code: item.from,
      date: item.create_datetime,
      transporter: json.transporter,
      status: json.status,
      count: json.count_places,
      weight: json.gross_weight,
      departure: item.start_datetime,
      delivery: item.complete_datetime
    }
  })
}

export const getSendingById = sendingId => async () => {
  if (sendingId === 'create') {
    const response = await axios.postWithAuth('/query/select', { sql: `SELECT max(int('from')) FROM trip WHERE YEAR(create_datetime) = YEAR('${dayjs().format('YYYY-MM-DD')}')` })
    console.log(response)
    return {}
  } else {
    const response = await axios.postWithAuth('/query/select', { sql: `SELECT * FROM trip WHERE id_trip=${sendingId}` })
    const item = (response.data?.data || [])[0] || {}
    try {
      item.json = JSON.parse(item.json.replaceAll("\n", ''))
    } catch (e) {
      console.warn('Bad sending json')
    }
    item.create_datetime = dayjs(item.create_datetime)
    item.start_datetime = dayjs(item.start_datetime)
    item.complete_datetime = dayjs(item.complete_datetime)
    return item
  }
}

export const deleteSendingById = sendingId => async () => {
  const response = await axios.postWithAuth('/query/delete', { sql: `DELETE FROM trip WHERE id_trip=${sendingId}` })
  return response
}

export const getPlaceById = placeId => async () => {
  return {}
}