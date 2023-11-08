import { useEffect } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import { Row } from 'antd'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import PageContent from './pages/Content'
import PageLogin from './pages/Login'
import PageMatch from './pages/Match'
import PageMatches from './pages/Matches'
import PageNotifications from './pages/Notifications'
import PageStadium from './pages/Stadium'
import PageStadiums from './pages/Stadiums'
import PageTeam from './pages/Team'
import PageTeams from './pages/Teams'
import PageTemplates from './pages/Templates'
import PageTournament from './pages/Tournament'
import PageTournaments from './pages/Tournaments'
import PageTickets from './pages/Tickets'
import PageTranslations from './pages/Translations'
import PageUsers from './pages/Users'
import PageUser from './pages/User'
import Sendings from './pages/Sendings'
import Sending from './pages/Sending'
import SendingCreate from './pages/Sending/SendingCreate'
import PlaceCreate from './pages/Place/PlaceCreate'
import Place from './pages/Place'
import Product from './pages/Product'
import Layout from './components/Layout'
import { authorizeByTokens } from './redux/user'
import { fetchConfig } from './redux/config'
import './App.css'
import ProductCreate from './pages/Product/ProductCreate'


function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthorized = useSelector(state => state.user.authorized)
  const isLoading = useSelector(state => state.user.isLoading)
  const isConfigLoaded = useSelector(state => state.config.isLoaded)
  const isLoginPage = location.pathname === '/login'

  useEffect(() => {
    dispatch(fetchConfig)
  }, [])

  useEffect(() => {
    dispatch(authorizeByTokens).then(role => {
      if (!role) {
        navigate('/login', { replace: true })
      } else if (isLoginPage) {
        navigate(role === '4' ? '/users' : '/tickets', { replace: true })
      }
    })
  }, [isLoginPage])

  if (!isConfigLoaded || ((isLoading || !isAuthorized) && !isLoginPage)) {
    return (
      <Row style={{ height: '100vh' }} justify="center" align="middle">
        <LoadingOutlined style={{ fontSize: '64px' }} />
      </Row>
    )
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/translations" element={<PageTranslations />} />
          <Route path="/content/:page" element={<PageContent />} />
          <Route path="/templates/:page" element={<PageTemplates />} />
          <Route path="/users" element={<PageUsers />} />
          <Route path="/users/:id" element={<PageUser />} />
          <Route path="/matches" element={<PageMatches />} />
          <Route path="/matches/:id" element={<PageMatch />} />
          <Route path="/notifications" element={<PageNotifications />} />
          <Route path="/teams" element={<PageTeams />} />
          <Route path="/teams/:id" element={<PageTeam />} />
          <Route path="/stadiums" element={<PageStadiums />} />
          <Route path="/stadiums/:id" element={<PageStadium />} />
          <Route path="/tournaments" element={<PageTournaments />} />
          <Route path="/tournaments/:id" element={<PageTournament />} />
          <Route path="/tickets/:matchId?" element={<PageTickets />} />
          <Route path="/sendings/create" element={<SendingCreate />} />
          <Route path="/sendings" element={<Sendings />} />
          <Route path="/sendings/:id" element={<Sending />} />
          <Route path="/sendings/:id/create" element={<PlaceCreate />} />
          <Route path="/sendings/:id/:id" element={<Place />} />
          <Route path="/sendings/:id/:id/create" element={<ProductCreate />} />
          <Route path="/sendings/:id/:id/:id" element={<Product />} />
        </Route>
        <Route path="/login" element={<PageLogin />} />
      </Routes>
    </div>
  )
}

export default App
