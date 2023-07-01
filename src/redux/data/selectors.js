import { createSelector } from 'reselect'

const extendTeam = (id, teams, stadiums) => {
  const team = teams[id]
  if (!team) return null
  const stadium = stadiums[team.stadium]
  return {
    ...team,
    stadium
  }
}

export const getStadium = createSelector(
  (state, stadiumId) => stadiumId,
  state => state.data.stadiums,
  (id, stadiums) => stadiums[id]
)

export const getTournament = createSelector(
  (state, tournamentId) => tournamentId,
  state => state.data.tournaments,
  (id, tournaments) => tournaments[id]
)

export const getTeam = createSelector(
  (state, teamId) => teamId,
  state => state.data.teams,
  state => state.data.stadiums,
  extendTeam
)

export const getMatch = createSelector(
  (state, matchId) => matchId,
  state => state.data.schedule,
  state => state.data.teams,
  state => state.data.tournaments,
  state => state.data.stadiums,
  (id, schedule, teams, tournaments, stadiums) => {
    const match = schedule[id]
    return {
      ...match,
      team1: extendTeam(match.team1, teams, stadiums),
      team2: extendTeam(match.team2, teams, stadiums),
      stadium: stadiums[match.stadium],
      tournament: tournaments[match.tournament]
    }
  }
)

export const getSchedule = createSelector(
  state => state,
  state => {
    const { schedule } = state.data
    return Object.keys(schedule).map(id => getMatch(state, id))
  }
)