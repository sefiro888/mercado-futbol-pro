import DATA from '@/data/champions.json'
import CompetitionPage from './CompetitionPage.jsx'
import { TrophyChampions } from './TrophyIcon.jsx'

export default function Champions() {
  return <CompetitionPage data={DATA} TrophyComponent={TrophyChampions} />
}
