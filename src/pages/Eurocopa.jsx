import DATA from '@/data/eurocopa.json'
import CompetitionPage from './CompetitionPage.jsx'
import { TrophyEurocopa } from './TrophyIcon.jsx'

export default function Eurocopa() {
  return <CompetitionPage data={DATA} TrophyComponent={TrophyEurocopa} />
}
