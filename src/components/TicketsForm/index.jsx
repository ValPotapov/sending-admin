import { useMemo, useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Col, Row, Form, Button, Select, Modal, Tooltip, Input, InputNumber } from 'antd'
import { PlusCircleFilled, MinusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import axios from '../../utils/axios'
import { capitalizeFirstLetter } from '../../utils/string'
import { getSchedule, getMatch } from '../../redux/data'
import { fetchTicketGroups } from '../../redux/tickets'

const getOptions = obj => Object.values(obj)
  .map(item => ({ label: item.en, value: item.id }))
  .sort((item1, item2) => item1.label > item2.label ? 1 : -1)

function AddTicketsModal({
  isOpen,
  stadiumBlocks,
  onSubmit = () => {},
  hideModal = () => {}
}) {
  const [ confirmLoading, setConfirmLoading ] = useState(false)
  const [ form ] = Form.useForm()

  return (
    <Modal
      width={800}
      title='Add tickets'
      okText='Save'
      open={isOpen}
      confirmLoading={confirmLoading}
      onOk={() => {
        setConfirmLoading(true)
        form
          .validateFields()
          .then((values) => {
            onSubmit(values)
            form.resetFields()
            hideModal()
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          })
      }}
      onCancel={() => {
        form.resetFields()
        hideModal()
      }}
      destroyOnClose
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          tickets: [{}]
        }}
      >
        <Form.List name='tickets'>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <Row key={key}>
                  <Col
                    span={4}
                  >
                    <Form.Item
                      label='Block'
                      name={[name, 'block']}
                      rules={[{ required: true, message: 'Please input block' }]}
                    >
                      <Select
                        size='large'
                        placeholder='Block'
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={stadiumBlocks}
                        style={{ width: '100%' }}
                        showSearch
                      />
                    </Form.Item>
                  </Col>
                  <Col span={4} offset={1}>
                    <Form.Item
                      label='Row'
                      name={[name, 'row']}
                      rules={[{ required: true, message: 'Please input row' }]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        size='large'
                        min={1}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8} offset={1}>
                    <Form.Item
                      label={
                        <Tooltip title='You can enter multiple values separated by commas (1,2,3), or a range of values separated by a hyphen (1-4)'>
                          <span>Seats <QuestionCircleOutlined /></span>
                        </Tooltip>
                      }
                      name={[name, 'seats']}
                      rules={[{ required: true, message: 'Please input seats' }]}
                    >
                      <Input
                        size='large'
                      />
                    </Form.Item>
                  </Col>
                  <Col span={4} offset={1}>
                    <Form.Item
                      label='Price'
                      name={[name, 'price']}
                      rules={[{ required: true, message: 'Please input price' }]}
                    >
                      <InputNumber
                        size='large'
                        addonAfter='$'
                      />
                    </Form.Item>
                  </Col>
                  <Col span={1}>
                    <MinusCircleOutlined
                      style={{
                        margin: '42px 0 0 10px',
                        visibility: fields.length > 1 ? 'visible' : 'hidden'
                      }}
                      onClick={() => remove(name)}
                    />
                  </Col>
                </Row>
              ))}
              <Form.Item>
                <Button
                  onClick={() => add()}
                  size='large'
                  block
                >
                  One more block
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  )
}

export default function TicketsForm({
  matchId
}) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const match = useSelector(state => getMatch(state, matchId))
  const [ tournamentValue, setTournamentValue ] = useState(match?.tournament.id)
  const [ stadiumBlocks, setStadiumBlocks ] = useState([])
  const [ isShowModal, setShowModal ] = useState(false)

  const initialValues = !matchId ? {} : {
    tournament: match?.tournament.id,
    match: match?.id
  }

  const handleAddTickets = useCallback((values) => {
    const { tickets } = values
    const stadiumId = match.stadium || match.team1?.stadium?.id
    const t_options = tickets.reduce((acc, ticket, i) => {
      const { block, row, seats, price } = ticket
      const key = i + 1
      const prefix = `${stadiumId};${block};${row}`
      acc.price[key] = price
      seats.replaceAll(' ', '').split(',').forEach(seat => {
        const range = seat.split('-').map(Number)
        if (range.length === 2) {
          const min = Math.min(...range)
          const max = Math.max(...range)
          for (let j = min; j <= max; j++) {
            acc.seats_sold[`${prefix};${j}`] = key
          }
        } else {
          acc.seats_sold[`${prefix};${seat}`] = key
        }
      })
      return acc
    }, { seats_sold: {}, price: {} })
    const t_start_address = `sc_id\u0000${match.id}`
    const data = JSON.stringify({ t_options, t_start_address })
    axios.postWithAuth('/trip', { data })
      .then(() => {
        dispatch(fetchTicketGroups)
      })
      .catch(e => {
        console.error(e)
      })
  }, [match])

  const tournaments = useSelector(state => state.data.tournaments)
  const schedule = useSelector(getSchedule)

  useEffect(() => {
    if (!match) return
    setStadiumBlocks([])
    const stadiumId = match.stadium || match.team1?.stadium?.id
    axios.post(`/data?fields=1&key=${stadiumId}`)
      .then(({ data }) => {
        const { scheme } = data.data.data.stadiums[stadiumId] || {}
        const jsonScheme = JSON.parse(scheme.replaceAll('\'', '"'))
        const { sections } = jsonScheme
        const blocks = Object.keys(sections).map(section => {
          const label = capitalizeFirstLetter(section.split('-').join(' '))
          const options = Object.keys(sections[section].blocks).map(block => ({
            label: block.toUpperCase(),
            value: block
          }))
          return { label, options }
        })
        setStadiumBlocks(blocks)
      })
      .catch(e => console.error(e))
  }, [match])

  const tournamentsOptions = useMemo(() => getOptions(tournaments), [tournaments])
  const matchesOptions = useMemo(
    () => Object.values(schedule)
      .filter(item => item.tournament.id === tournamentValue)
      .map(item => ({ label: `${dayjs(item.datetime).format('DD.MM.YY')} ${item.team1.en} — ${item.team2.en}`, value: item.id })),
    [schedule, tournamentValue]
  )

  return (
    <>
      <Form
        layout='vertical'
        onFinish={values => {
          
        }}
        initialValues={initialValues}
      >
        <Row style={{ margin: '20px 20px 0 20px' }}>
          <Col
            span={11}
          >
            <Form.Item
              label='Tournament'
              name='tournament'
              rules={[{ required: true, message: 'Please input tournament' }]}
            >
              <Select
                size='large'
                placeholder='Tournament'
                onChange={setTournamentValue}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={tournamentsOptions}
                style={{ width: '100%' }}
                showSearch
              />
            </Form.Item>
          </Col>
          <Col span={1} />
          <Col span={11}>
            <Form.Item
              label='Match'
              name='match'
              rules={[{ required: true, message: 'Please input match' }]}
            >
              <Select
                size='large'
                placeholder='Match'
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={matchesOptions}
                disabled={!tournamentValue}
                style={{ width: '100%' }}
                onSelect={value => navigate(`/tickets/${value}`)}
                showSearch
              />
            </Form.Item>
          </Col>
        </Row>
        {stadiumBlocks.length > 0 && 
          <>
            <Row style={{ margin: '20px 0 0 20px' }}>
              <Col>
                <Button
                  type='primary'
                  icon={<PlusCircleFilled />}
                  onClick={() => setShowModal(true)}
                >
                  Add tickets
                </Button>
              </Col>
            </Row>
          </>
        }
      </Form>
      <AddTicketsModal
        isOpen={isShowModal}
        stadiumBlocks={stadiumBlocks}
        onSubmit={handleAddTickets}
        hideModal={() => setShowModal(false)}
      />
    </>
  )
}