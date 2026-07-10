import DATA from '@/data/libertadores.json'
import CompetitionPage from './CompetitionPage.jsx'
import { TrophyLibertadores } from './TrophyIcon.jsx'

export default function Libertadores() {
  return <CompetitionPage data={DATA} TrophyComponent={TrophyLibertadores} />
}
