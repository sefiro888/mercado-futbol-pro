import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const teamsRoot = path.join(root, 'src', 'data', 'teams')

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

const teamFiles = new Map()
const teams = new Map()

function loadTeams() {
  const stack = [teamsRoot]
  while (stack.length) {
    const current = stack.pop()
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(full)
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        const data = readJson(full)
        if (data?.club?.id) {
          teams.set(data.club.id, data)
          teamFiles.set(data.club.id, full)
        }
      }
    }
  }
}

function p({
  id,
  name,
  birthDate,
  nationality,
  position,
  height,
  dominantFoot = 'Derecho',
  marketValue = 1,
  contractUntil = '2028-06-30',
  shirtNumber = null,
  status = 'suplente',
}) {
  return {
    id,
    name,
    slug: id,
    birthDate,
    nationality,
    position,
    height,
    dominantFoot,
    marketValue,
    contractUntil,
    shirtNumber,
    status,
  }
}

function makeTeam(file, club, players) {
  const data = { club, players }
  teams.set(club.id, data)
  teamFiles.set(club.id, path.join(root, file))
}

function team(id) {
  const data = teams.get(id)
  if (!data) throw new Error(`Unknown club: ${id}`)
  return data
}

function updateClub(id, patch) {
  Object.assign(team(id).club, patch)
}

function removePlayer(clubId, playerId) {
  const data = teams.get(clubId)
  if (!data) return null
  const idx = data.players.findIndex((player) => player.id === playerId)
  if (idx === -1) return null
  return data.players.splice(idx, 1)[0]
}

function upsertPlayer(clubId, player) {
  const data = team(clubId)
  const idx = data.players.findIndex((item) => item.id === player.id)
  if (idx === -1) {
    data.players.push(player)
  } else {
    data.players[idx] = { ...data.players[idx], ...player }
  }
}

function movePlayer(playerId, fromClubId, toClubId, fallback, patch = {}) {
  const existing = fromClubId ? removePlayer(fromClubId, playerId) : null
  upsertPlayer(toClubId, { ...(fallback || existing), ...existing, ...patch, id: playerId })
}

function ensureSources() {
  const file = path.join(root, 'src', 'data', 'sources.json')
  const sources = readJson(file)
  const byId = new Map(sources.map((source) => [source.id, source]))
  const extra = [
    {
      id: 'src-as',
      name: 'Diario AS',
      domain: 'as.com',
      url: 'https://as.com/futbol/',
      country: 'España',
      type: 'medio-deportivo',
      reliabilityLevel: 'alta',
    },
    {
      id: 'src-wikipedia',
      name: 'Wikipedia',
      domain: 'wikipedia.org',
      url: 'https://www.wikipedia.org/',
      country: 'Internacional',
      type: 'base-de-datos',
      reliabilityLevel: 'media',
    },
  ]
  for (const source of extra) {
    if (!byId.has(source.id)) sources.push(source)
  }
  writeJson(file, sources)
}

function updateLeagueCompositionAndCoaches() {
  const updates = {
    alaves: { coach: 'Quique Sánchez Flores' },
    'athletic-club': { coach: 'Edin Terzic' },
    elche: { coach: 'Martín Anselmi' },
    levante: { coach: 'Luís Castro' },
    osasuna: { coach: 'Luis Miguel Ramis' },
    'rayo-vallecano': { coach: 'Beñat San José' },
    'real-madrid': { coach: 'José Mourinho' },
    'real-sociedad': { coach: 'Pellegrino Matarazzo' },
    sevilla: { coach: 'Luis García Plaza' },
    villarreal: { coach: 'Íñigo Pérez' },
    girona: { league: 'Segunda División' },
    mallorca: { league: 'Segunda División' },
    'real-oviedo': { league: 'Segunda División' },
    bournemouth: { coach: 'Marco Rose' },
    chelsea: { coach: 'Xabi Alonso' },
    'crystal-palace': { coach: 'Pierre Sage' },
    fulham: { coach: 'Por confirmar' },
    liverpool: { coach: 'Andoni Iraola' },
    'manchester-city': { coach: 'Por confirmar' },
    'manchester-united': { coach: 'Michael Carrick' },
    'nottingham-forest': { coach: 'Vítor Pereira' },
    tottenham: { coach: 'Roberto De Zerbi' },
    burnley: { league: 'Championship' },
    'west-ham': { league: 'Championship' },
    wolves: { league: 'Championship' },
  }

  for (const [id, patch] of Object.entries(updates)) {
    if (teams.has(id)) updateClub(id, patch)
  }
}

function addPromotedTeams() {
  makeTeam('src/data/teams/laliga/deportivo.json', {
    id: 'deportivo',
    name: 'Deportivo de La Coruña',
    slug: 'deportivo',
    country: 'España',
    league: 'LaLiga',
    city: 'A Coruña',
    stadium: 'Riazor',
    coach: 'Antonio Hidalgo',
    founded: 1906,
    primaryColor: '#005BAC',
  }, [
    p({ id: 'german-parreno', name: 'Germán Parreño', birthDate: '1993-02-16', nationality: 'España', position: 'Portero', height: 189, marketValue: 1.5, contractUntil: '2027-06-30', shirtNumber: 1, status: 'titular' }),
    p({ id: 'helton-leite', name: 'Helton Leite', birthDate: '1990-11-02', nationality: 'Brasil', position: 'Portero', height: 196, marketValue: 1.2, contractUntil: '2028-06-30', shirtNumber: 13 }),
    p({ id: 'ximo-navarro', name: 'Ximo Navarro', birthDate: '1990-01-23', nationality: 'España', position: 'Defensa central', height: 178, marketValue: 0.8, contractUntil: '2027-06-30', shirtNumber: 2, status: 'titular' }),
    p({ id: 'pablo-vazquez', name: 'Pablo Vázquez', birthDate: '1994-10-07', nationality: 'España', position: 'Defensa central', height: 189, marketValue: 1.5, contractUntil: '2028-06-30', shirtNumber: 15, status: 'titular' }),
    p({ id: 'dani-barcia', name: 'Dani Barcia', birthDate: '2003-01-19', nationality: 'España', position: 'Defensa central', height: 185, marketValue: 1.8, contractUntil: '2029-06-30', shirtNumber: 5 }),
    p({ id: 'diego-villares', name: 'Diego Villares', birthDate: '1996-06-17', nationality: 'España', position: 'Mediocentro', height: 189, marketValue: 3, contractUntil: '2029-06-30', shirtNumber: 8, status: 'titular' }),
    p({ id: 'jose-angel-jurado', name: 'José Ángel Jurado', birthDate: '1992-06-21', nationality: 'España', position: 'Mediocentro defensivo', height: 182, marketValue: 1.5, contractUntil: '2027-06-30', shirtNumber: 20 }),
    p({ id: 'mario-soriano', name: 'Mario Soriano', birthDate: '2002-04-22', nationality: 'España', position: 'Mediapunta', height: 163, marketValue: 4, contractUntil: '2028-06-30', shirtNumber: 10, status: 'titular' }),
    p({ id: 'charlie-patino', name: 'Charlie Patino', birthDate: '2003-10-17', nationality: 'Inglaterra', position: 'Mediocentro', height: 182, marketValue: 6, contractUntil: '2030-06-30', shirtNumber: 16, status: 'titular' }),
    p({ id: 'yeremay-hernandez', name: 'Yeremay Hernández', birthDate: '2002-12-10', nationality: 'España', position: 'Extremo izquierdo', height: 169, dominantFoot: 'Izquierdo', marketValue: 20, contractUntil: '2030-06-30', shirtNumber: 7, status: 'titular' }),
    p({ id: 'david-mella', name: 'David Mella', birthDate: '2005-05-23', nationality: 'España', position: 'Extremo derecho', height: 172, dominantFoot: 'Izquierdo', marketValue: 8, contractUntil: '2029-06-30', shirtNumber: 17, status: 'titular' }),
    p({ id: 'ivan-barbero', name: 'Iván Barbero', birthDate: '1998-08-17', nationality: 'España', position: 'Delantero centro', height: 187, marketValue: 2.5, contractUntil: '2027-06-30', shirtNumber: 9, status: 'titular' }),
    p({ id: 'noel-lopez', name: 'Noel López', birthDate: '2003-03-17', nationality: 'España', position: 'Delantero centro', height: 182, marketValue: 2.5, contractUntil: '2029-06-30', shirtNumber: 19 }),
  ])

  makeTeam('src/data/teams/laliga/malaga.json', {
    id: 'malaga',
    name: 'Málaga CF',
    slug: 'malaga',
    country: 'España',
    league: 'LaLiga',
    city: 'Málaga',
    stadium: 'La Rosaleda',
    coach: 'Sergio Pellicer',
    founded: 1904,
    primaryColor: '#74C6E6',
  }, [
    p({ id: 'alfonso-herrero', name: 'Alfonso Herrero', birthDate: '1994-04-21', nationality: 'España', position: 'Portero', height: 183, marketValue: 1.8, contractUntil: '2028-06-30', shirtNumber: 1, status: 'titular' }),
    p({ id: 'carlos-puga', name: 'Carlos Puga', birthDate: '2000-12-26', nationality: 'España', position: 'Lateral derecho', height: 177, marketValue: 1.6, contractUntil: '2028-06-30', shirtNumber: 2, status: 'titular' }),
    p({ id: 'einar-galilea', name: 'Einar Galilea', birthDate: '1994-05-22', nationality: 'España', position: 'Defensa central', height: 182, marketValue: 1.2, contractUntil: '2027-06-30', shirtNumber: 4, status: 'titular' }),
    p({ id: 'nelson-monte', name: 'Nelson Monte', birthDate: '1995-07-30', nationality: 'Portugal', position: 'Defensa central', height: 187, marketValue: 1.5, contractUntil: '2027-06-30', shirtNumber: 5 }),
    p({ id: 'victor-garcia-malaga', name: 'Víctor García', birthDate: '1994-05-31', nationality: 'España', position: 'Lateral izquierdo', height: 179, dominantFoot: 'Izquierdo', marketValue: 1.2, contractUntil: '2027-06-30', shirtNumber: 14, status: 'titular' }),
    p({ id: 'luismi-sanchez', name: 'Luismi Sánchez', birthDate: '1992-05-05', nationality: 'España', position: 'Mediocentro defensivo', height: 180, marketValue: 1.5, contractUntil: '2027-06-30', shirtNumber: 6, status: 'titular' }),
    p({ id: 'manu-molina', name: 'Manu Molina', birthDate: '1991-11-20', nationality: 'España', position: 'Mediocentro', height: 177, marketValue: 1, contractUntil: '2027-06-30', shirtNumber: 8 }),
    p({ id: 'david-larrubia', name: 'David Larrubia', birthDate: '2002-04-20', nationality: 'España', position: 'Mediapunta', height: 172, dominantFoot: 'Izquierdo', marketValue: 4, contractUntil: '2029-06-30', shirtNumber: 10, status: 'titular' }),
    p({ id: 'kevin-medina', name: 'Kevin Medina', birthDate: '2001-03-11', nationality: 'España', position: 'Extremo izquierdo', height: 173, marketValue: 3.5, contractUntil: '2028-06-30', shirtNumber: 11, status: 'titular' }),
    p({ id: 'julen-lobete', name: 'Julen Lobete', birthDate: '2000-09-18', nationality: 'España', position: 'Extremo derecho', height: 178, marketValue: 2.5, contractUntil: '2028-06-30', shirtNumber: 7 }),
    p({ id: 'luis-suarez-malaga', name: 'Luis Suárez', birthDate: '1997-12-02', nationality: 'Colombia', position: 'Delantero centro', height: 185, marketValue: 7, contractUntil: '2029-06-30', shirtNumber: 9, status: 'titular' }),
    p({ id: 'sergio-leon', name: 'Sergio León', birthDate: '1989-01-06', nationality: 'España', position: 'Delantero centro', height: 178, marketValue: 1, contractUntil: '2027-06-30', shirtNumber: 12 }),
  ])

  makeTeam('src/data/teams/laliga/racing-santander.json', {
    id: 'racing-santander',
    name: 'Racing de Santander',
    slug: 'racing-santander',
    country: 'España',
    league: 'LaLiga',
    city: 'Santander',
    stadium: 'El Sardinero',
    coach: 'José Alberto López',
    founded: 1913,
    primaryColor: '#00843D',
  }, [
    p({ id: 'jokin-ezkieta', name: 'Jokin Ezkieta', birthDate: '1996-08-17', nationality: 'España', position: 'Portero', height: 193, marketValue: 2.5, contractUntil: '2028-06-30', shirtNumber: 13, status: 'titular' }),
    p({ id: 'inigo-sainz-maza', name: 'Íñigo Sainz-Maza', birthDate: '1998-06-16', nationality: 'España', position: 'Lateral derecho', height: 177, marketValue: 2, contractUntil: '2027-06-30', shirtNumber: 6, status: 'titular' }),
    p({ id: 'alvaro-mantilla', name: 'Álvaro Mantilla', birthDate: '2000-05-09', nationality: 'España', position: 'Defensa central', height: 182, marketValue: 3, contractUntil: '2028-06-30', shirtNumber: 2, status: 'titular' }),
    p({ id: 'german-sanchez', name: 'Germán Sánchez', birthDate: '1986-10-31', nationality: 'España', position: 'Defensa central', height: 187, marketValue: 0.8, contractUntil: '2027-06-30', shirtNumber: 5 }),
    p({ id: 'saul-garcia-racing', name: 'Saúl García', birthDate: '1994-11-09', nationality: 'España', position: 'Lateral izquierdo', height: 183, dominantFoot: 'Izquierdo', marketValue: 1.8, contractUntil: '2027-06-30', shirtNumber: 3 }),
    p({ id: 'facu-gonzalez', name: 'Facu González', birthDate: '2003-07-06', nationality: 'Uruguay', position: 'Defensa central', height: 193, dominantFoot: 'Izquierdo', marketValue: 4, contractUntil: '2029-06-30', shirtNumber: 24, status: 'titular' }),
    p({ id: 'aritz-aldasoro', name: 'Aritz Aldasoro', birthDate: '1999-06-05', nationality: 'España', position: 'Mediocentro', height: 176, marketValue: 2.5, contractUntil: '2028-06-30', shirtNumber: 8, status: 'titular' }),
    p({ id: 'unai-vencedor', name: 'Unai Vencedor', birthDate: '2000-11-15', nationality: 'España', position: 'Mediocentro defensivo', height: 176, marketValue: 4, contractUntil: '2029-06-30', shirtNumber: 16, status: 'titular' }),
    p({ id: 'sergio-canales', name: 'Sergio Canales', birthDate: '1991-02-16', nationality: 'España', position: 'Mediapunta', height: 176, dominantFoot: 'Izquierdo', marketValue: 6, contractUntil: '2028-06-30', shirtNumber: 10, status: 'titular' }),
    p({ id: 'inigo-vicente', name: 'Íñigo Vicente', birthDate: '1998-01-06', nationality: 'España', position: 'Extremo izquierdo', height: 178, dominantFoot: 'Derecho', marketValue: 5, contractUntil: '2028-06-30', shirtNumber: 7, status: 'titular' }),
    p({ id: 'andres-martin', name: 'Andrés Martín', birthDate: '1999-07-11', nationality: 'España', position: 'Extremo derecho', height: 178, dominantFoot: 'Izquierdo', marketValue: 4, contractUntil: '2028-06-30', shirtNumber: 11, status: 'titular' }),
    p({ id: 'asier-villalibre', name: 'Asier Villalibre', birthDate: '1997-09-30', nationality: 'España', position: 'Delantero centro', height: 184, dominantFoot: 'Izquierdo', marketValue: 4, contractUntil: '2029-06-30', shirtNumber: 9, status: 'titular' }),
  ])

  makeTeam('src/data/teams/premier/coventry.json', {
    id: 'coventry',
    name: 'Coventry City',
    slug: 'coventry',
    country: 'Inglaterra',
    league: 'Premier League',
    city: 'Coventry',
    stadium: 'Coventry Building Society Arena',
    coach: 'Frank Lampard',
    founded: 1883,
    primaryColor: '#77BEE9',
  }, [
    p({ id: 'oliver-dovin', name: 'Oliver Dovin', birthDate: '2002-07-11', nationality: 'Suecia', position: 'Portero', height: 187, marketValue: 4, contractUntil: '2028-06-30', shirtNumber: 1, status: 'titular' }),
    p({ id: 'milan-van-ewijk', name: 'Milan van Ewijk', birthDate: '2000-09-08', nationality: 'Países Bajos', position: 'Lateral derecho', height: 175, marketValue: 8, contractUntil: '2028-06-30', shirtNumber: 27, status: 'titular' }),
    p({ id: 'bobby-thomas', name: 'Bobby Thomas', birthDate: '2001-01-30', nationality: 'Inglaterra', position: 'Defensa central', height: 186, marketValue: 7, contractUntil: '2027-06-30', shirtNumber: 4, status: 'titular' }),
    p({ id: 'luis-binks', name: 'Luis Binks', birthDate: '2001-09-02', nationality: 'Inglaterra', position: 'Defensa central', height: 188, dominantFoot: 'Izquierdo', marketValue: 4, contractUntil: '2028-06-30', shirtNumber: 2 }),
    p({ id: 'liam-kitching', name: 'Liam Kitching', birthDate: '1999-09-25', nationality: 'Inglaterra', position: 'Defensa central', height: 191, dominantFoot: 'Izquierdo', marketValue: 4, contractUntil: '2027-06-30', shirtNumber: 15 }),
    p({ id: 'jay-dasilva', name: 'Jay Dasilva', birthDate: '1998-04-22', nationality: 'Inglaterra', position: 'Lateral izquierdo', height: 170, dominantFoot: 'Izquierdo', marketValue: 2.5, contractUntil: '2027-06-30', shirtNumber: 3 }),
    p({ id: 'ben-sheaf', name: 'Ben Sheaf', birthDate: '1998-02-05', nationality: 'Inglaterra', position: 'Mediocentro defensivo', height: 185, marketValue: 10, contractUntil: '2028-06-30', shirtNumber: 14, status: 'titular' }),
    p({ id: 'jack-rudoni', name: 'Jack Rudoni', birthDate: '2001-06-14', nationality: 'Inglaterra', position: 'Mediapunta', height: 185, dominantFoot: 'Izquierdo', marketValue: 8, contractUntil: '2028-06-30', shirtNumber: 5, status: 'titular' }),
    p({ id: 'jamie-allen', name: 'Jamie Allen', birthDate: '1995-01-29', nationality: 'Inglaterra', position: 'Mediocentro', height: 180, marketValue: 2, contractUntil: '2027-06-30', shirtNumber: 8 }),
    p({ id: 'ephron-mason-clark', name: 'Ephron Mason-Clark', birthDate: '1999-08-25', nationality: 'Inglaterra', position: 'Extremo izquierdo', height: 178, marketValue: 5, contractUntil: '2028-06-30', shirtNumber: 10, status: 'titular' }),
    p({ id: 'haji-wright', name: 'Haji Wright', birthDate: '1998-03-27', nationality: 'Estados Unidos', position: 'Delantero centro', height: 193, marketValue: 12, contractUntil: '2028-06-30', shirtNumber: 11, status: 'titular' }),
    p({ id: 'brandon-thomas-asante', name: 'Brandon Thomas-Asante', birthDate: '1998-12-29', nationality: 'Ghana', position: 'Delantero centro', height: 180, marketValue: 5, contractUntil: '2028-06-30', shirtNumber: 23 }),
  ])

  makeTeam('src/data/teams/premier/hull-city.json', {
    id: 'hull-city',
    name: 'Hull City',
    slug: 'hull-city',
    country: 'Inglaterra',
    league: 'Premier League',
    city: 'Hull',
    stadium: 'MKM Stadium',
    coach: 'Sergej Jakirović',
    founded: 1904,
    primaryColor: '#F28C28',
  }, [
    p({ id: 'ivor-pandur', name: 'Ivor Pandur', birthDate: '2000-03-25', nationality: 'Croacia', position: 'Portero', height: 187, marketValue: 6, contractUntil: '2028-06-30', shirtNumber: 1, status: 'titular' }),
    p({ id: 'lewie-coyle', name: 'Lewie Coyle', birthDate: '1995-10-15', nationality: 'Inglaterra', position: 'Lateral derecho', height: 173, marketValue: 2.5, contractUntil: '2027-06-30', shirtNumber: 2, status: 'titular' }),
    p({ id: 'cody-drameh', name: 'Cody Drameh', birthDate: '2001-12-08', nationality: 'Inglaterra', position: 'Lateral derecho', height: 175, marketValue: 4, contractUntil: '2028-06-30', shirtNumber: 23 }),
    p({ id: 'charlie-hughes', name: 'Charlie Hughes', birthDate: '2003-10-16', nationality: 'Inglaterra', position: 'Defensa central', height: 185, marketValue: 5, contractUntil: '2028-06-30', shirtNumber: 4, status: 'titular' }),
    p({ id: 'alfie-jones', name: 'Alfie Jones', birthDate: '1997-10-07', nationality: 'Inglaterra', position: 'Defensa central', height: 191, marketValue: 3, contractUntil: '2027-06-30', shirtNumber: 5, status: 'titular' }),
    p({ id: 'matty-jacob', name: 'Matty Jacob', birthDate: '2001-06-03', nationality: 'Inglaterra', position: 'Lateral izquierdo', height: 180, dominantFoot: 'Izquierdo', marketValue: 2.5, contractUntil: '2028-06-30', shirtNumber: 29 }),
    p({ id: 'regan-slater', name: 'Regan Slater', birthDate: '1999-09-11', nationality: 'Inglaterra', position: 'Mediocentro', height: 173, marketValue: 4, contractUntil: '2027-06-30', shirtNumber: 27, status: 'titular' }),
    p({ id: 'xavier-simons', name: 'Xavier Simons', birthDate: '2003-02-20', nationality: 'Inglaterra', position: 'Mediocentro defensivo', height: 179, marketValue: 4, contractUntil: '2028-06-30', shirtNumber: 18, status: 'titular' }),
    p({ id: 'abu-kamara', name: 'Abu Kamara', birthDate: '2003-07-21', nationality: 'Inglaterra', position: 'Extremo derecho', height: 183, dominantFoot: 'Izquierdo', marketValue: 6, contractUntil: '2028-06-30', shirtNumber: 44, status: 'titular' }),
    p({ id: 'mohamed-belloumi', name: 'Mohamed Belloumi', birthDate: '2002-06-01', nationality: 'Argelia', position: 'Extremo derecho', height: 174, dominantFoot: 'Izquierdo', marketValue: 5, contractUntil: '2028-06-30', shirtNumber: 33 }),
    p({ id: 'liam-millar', name: 'Liam Millar', birthDate: '1999-09-27', nationality: 'Canadá', position: 'Extremo izquierdo', height: 176, marketValue: 4, contractUntil: '2028-06-30', shirtNumber: 7, status: 'titular' }),
    p({ id: 'joe-gelhardt', name: 'Joe Gelhardt', birthDate: '2002-05-04', nationality: 'Inglaterra', position: 'Delantero centro', height: 179, dominantFoot: 'Izquierdo', marketValue: 6, contractUntil: '2029-06-30', shirtNumber: 9, status: 'titular' }),
  ])

  makeTeam('src/data/teams/premier/ipswich.json', {
    id: 'ipswich',
    name: 'Ipswich Town',
    slug: 'ipswich',
    country: 'Inglaterra',
    league: 'Premier League',
    city: 'Ipswich',
    stadium: 'Portman Road',
    coach: "Gary O'Neil",
    founded: 1878,
    primaryColor: '#0033A0',
  }, [
    p({ id: 'alex-palmer', name: 'Alex Palmer', birthDate: '1996-08-10', nationality: 'Inglaterra', position: 'Portero', height: 191, marketValue: 4, contractUntil: '2028-06-30', shirtNumber: 31, status: 'titular' }),
    p({ id: 'cieran-slicker', name: 'Cieran Slicker', birthDate: '2002-09-15', nationality: 'Escocia', position: 'Portero', height: 193, marketValue: 1.5, contractUntil: '2028-06-30', shirtNumber: 13 }),
    p({ id: 'harry-clarke', name: 'Harry Clarke', birthDate: '2001-03-02', nationality: 'Inglaterra', position: 'Lateral derecho', height: 180, marketValue: 5, contractUntil: '2028-06-30', shirtNumber: 2, status: 'titular' }),
    p({ id: 'dara-oshea', name: "Dara O'Shea", birthDate: '1999-03-04', nationality: 'Irlanda', position: 'Defensa central', height: 189, marketValue: 12, contractUntil: '2029-06-30', shirtNumber: 26, status: 'titular' }),
    p({ id: 'jacob-greaves', name: 'Jacob Greaves', birthDate: '2000-09-12', nationality: 'Inglaterra', position: 'Defensa central', height: 193, dominantFoot: 'Izquierdo', marketValue: 15, contractUntil: '2029-06-30', shirtNumber: 24, status: 'titular' }),
    p({ id: 'leif-davis', name: 'Leif Davis', birthDate: '1999-12-31', nationality: 'Inglaterra', position: 'Lateral izquierdo', height: 182, dominantFoot: 'Izquierdo', marketValue: 16, contractUntil: '2028-06-30', shirtNumber: 3, status: 'titular' }),
    p({ id: 'kalvin-phillips', name: 'Kalvin Phillips', birthDate: '1995-12-02', nationality: 'Inglaterra', position: 'Mediocentro defensivo', height: 179, marketValue: 15, contractUntil: '2029-06-30', shirtNumber: 8, status: 'titular' }),
    p({ id: 'massimo-luongo', name: 'Massimo Luongo', birthDate: '1992-09-25', nationality: 'Australia', position: 'Mediocentro', height: 176, marketValue: 1.5, contractUntil: '2027-06-30', shirtNumber: 25 }),
    p({ id: 'jack-taylor', name: 'Jack Taylor', birthDate: '1998-06-23', nationality: 'Irlanda', position: 'Mediocentro', height: 185, marketValue: 4, contractUntil: '2027-06-30', shirtNumber: 14 }),
    p({ id: 'omari-hutchinson', name: 'Omari Hutchinson', birthDate: '2003-10-29', nationality: 'Jamaica', position: 'Extremo derecho', height: 174, dominantFoot: 'Izquierdo', marketValue: 25, contractUntil: '2029-06-30', shirtNumber: 20, status: 'titular' }),
    p({ id: 'sammie-szmodics', name: 'Sammie Szmodics', birthDate: '1995-09-24', nationality: 'Irlanda', position: 'Mediapunta', height: 168, marketValue: 7, contractUntil: '2028-06-30', shirtNumber: 23, status: 'titular' }),
    p({ id: 'george-hirst', name: 'George Hirst', birthDate: '1999-02-15', nationality: 'Inglaterra', position: 'Delantero centro', height: 191, marketValue: 7, contractUntil: '2028-06-30', shirtNumber: 27, status: 'titular' }),
  ])
}

function updateSquads() {
  movePlayer('ibrahima-konate', 'liverpool', 'real-madrid', null, {
    name: 'Ibrahima Konaté',
    slug: 'ibrahima-konate',
    nationality: 'Francia',
    position: 'Defensa central',
    height: 194,
    dominantFoot: 'Derecho',
    marketValue: 55,
    contractUntil: '2030-06-30',
    shirtNumber: 24,
    status: 'titular',
  })
  movePlayer('marc-cucurella', 'chelsea', 'real-madrid', null, {
    name: 'Marc Cucurella',
    slug: 'marc-cucurella',
    nationality: 'España',
    position: 'Lateral izquierdo',
    height: 172,
    dominantFoot: 'Izquierdo',
    marketValue: 55,
    contractUntil: '2030-06-30',
    shirtNumber: 18,
    status: 'titular',
  })
  movePlayer('bernardo-silva', 'manchester-city', 'real-madrid', p({ id: 'bernardo-silva', name: 'Bernardo Silva', birthDate: '1994-08-10', nationality: 'Portugal', position: 'Mediapunta', height: 173, dominantFoot: 'Izquierdo', marketValue: 35, contractUntil: '2028-06-30', shirtNumber: 10, status: 'titular' }), { contractUntil: '2028-06-30', shirtNumber: 10, status: 'titular' })
  removePlayer('real-madrid', 'dani-carvajal')
  removePlayer('real-madrid', 'david-alaba')

  movePlayer('anthony-gordon', 'newcastle', 'barcelona', p({ id: 'anthony-gordon', name: 'Anthony Gordon', birthDate: '2001-02-24', nationality: 'Inglaterra', position: 'Extremo izquierdo', height: 183, marketValue: 60, contractUntil: '2031-06-30', shirtNumber: 19, status: 'titular' }), {
    contractUntil: '2031-06-30',
    shirtNumber: 19,
    status: 'titular',
  })
  movePlayer('robert-lewandowski', 'barcelona', 'atletico-madrid', null, {
    name: 'Robert Lewandowski',
    slug: 'robert-lewandowski',
    nationality: 'Polonia',
    position: 'Delantero centro',
    height: 185,
    dominantFoot: 'Derecho',
    marketValue: 8,
    contractUntil: '2027-06-30',
    shirtNumber: 9,
    status: 'titular',
  })
  upsertPlayer('atletico-madrid', p({ id: 'tyrick-mitchell', name: 'Tyrick Mitchell', birthDate: '1999-09-01', nationality: 'Inglaterra', position: 'Lateral izquierdo', height: 174, dominantFoot: 'Izquierdo', marketValue: 25, contractUntil: '2030-06-30', shirtNumber: 3, status: 'titular' }))
  removePlayer('atletico-madrid', 'antoine-griezmann')
  movePlayer('giacomo-raspadori', 'atletico-madrid', 'inter', null, {
    name: 'Giacomo Raspadori',
    slug: 'giacomo-raspadori',
    nationality: 'Italia',
    position: 'Delantero centro',
    height: 172,
    marketValue: 25,
    contractUntil: '2030-06-30',
    shirtNumber: 18,
    status: 'suplente',
  })

  upsertPlayer('athletic-club', p({ id: 'ansu-fati', name: 'Ansu Fati', birthDate: '2002-10-31', nationality: 'España', position: 'Extremo izquierdo', height: 178, marketValue: 18, contractUntil: '2027-06-30', shirtNumber: 11, status: 'titular' }))
  upsertPlayer('alaves', p({ id: 'cesar-montes', name: 'César Montes', birthDate: '1997-02-24', nationality: 'México', position: 'Defensa central', height: 195, marketValue: 5, contractUntil: '2029-06-30', shirtNumber: 3, status: 'titular' }))
  movePlayer('jon-guridi', 'alaves', 'sevilla', p({ id: 'jon-guridi', name: 'Jon Guridi', birthDate: '1995-02-28', nationality: 'España', position: 'Mediocentro', height: 179, marketValue: 5, contractUntil: '2029-06-30', shirtNumber: 18, status: 'titular' }), { contractUntil: '2029-06-30', shirtNumber: 18, status: 'titular' })
  movePlayer('juan-iglesias', 'getafe', 'sevilla', p({ id: 'juan-iglesias', name: 'Juan Iglesias', birthDate: '1998-07-03', nationality: 'España', position: 'Lateral derecho', height: 185, marketValue: 4, contractUntil: '2029-06-30', shirtNumber: 12, status: 'titular' }), { contractUntil: '2029-06-30', shirtNumber: 12, status: 'titular' })
  removePlayer('sevilla', 'cesar-azpilicueta')
  movePlayer('fran-beltran', 'celta-vigo', 'bournemouth', p({ id: 'fran-beltran', name: 'Fran Beltrán', birthDate: '1999-02-03', nationality: 'España', position: 'Mediocentro defensivo', height: 172, marketValue: 12, contractUntil: '2030-06-30', shirtNumber: 6, status: 'titular' }), { contractUntil: '2030-06-30', shirtNumber: 6, status: 'titular' })
  upsertPlayer('celta-vigo', p({ id: 'andre-silva', name: 'André Silva', birthDate: '1995-11-06', nationality: 'Portugal', position: 'Delantero centro', height: 185, marketValue: 8, contractUntil: '2028-06-30', shirtNumber: 9, status: 'titular' }))
  upsertPlayer('celta-vigo', p({ id: 'marcos-alonso', name: 'Marcos Alonso', birthDate: '1990-12-28', nationality: 'España', position: 'Lateral izquierdo', height: 189, dominantFoot: 'Izquierdo', marketValue: 2, contractUntil: '2027-06-30', shirtNumber: 17 }))
  upsertPlayer('elche', p({ id: 'ander-herrera', name: 'Ander Herrera', birthDate: '1989-08-14', nationality: 'España', position: 'Mediocentro', height: 182, marketValue: 1.5, contractUntil: '2027-06-30', shirtNumber: 21, status: 'titular' }))
  upsertPlayer('espanyol', p({ id: 'cyril-ngonge', name: 'Cyril Ngonge', birthDate: '2000-05-26', nationality: 'Bélgica', position: 'Extremo derecho', height: 179, dominantFoot: 'Izquierdo', marketValue: 8, contractUntil: '2029-06-30', shirtNumber: 11, status: 'titular' }))
  upsertPlayer('espanyol', p({ id: 'alvaro-morata', name: 'Álvaro Morata', birthDate: '1992-10-23', nationality: 'España', position: 'Delantero centro', height: 190, marketValue: 8, contractUntil: '2028-06-30', shirtNumber: 9, status: 'titular' }))
  movePlayer('benat-turrientes', 'real-sociedad', 'getafe', p({ id: 'benat-turrientes', name: 'Beñat Turrientes', birthDate: '2002-01-31', nationality: 'España', position: 'Mediocentro', height: 181, marketValue: 12, contractUntil: '2030-06-30', shirtNumber: 8, status: 'titular' }), { contractUntil: '2030-06-30', shirtNumber: 8, status: 'titular' })
  upsertPlayer('levante', p({ id: 'ryan-sessegnon', name: 'Ryan Sessegnon', birthDate: '2000-05-18', nationality: 'Inglaterra', position: 'Lateral izquierdo', height: 178, dominantFoot: 'Izquierdo', marketValue: 8, contractUntil: '2029-06-30', shirtNumber: 3, status: 'titular' }))
  upsertPlayer('levante', p({ id: 'azzedine-ounahi', name: 'Azzedine Ounahi', birthDate: '2000-04-19', nationality: 'Marruecos', position: 'Mediocentro', height: 182, marketValue: 10, contractUntil: '2029-06-30', shirtNumber: 8, status: 'titular' }))
  removePlayer('osasuna', 'juan-cruz')
  upsertPlayer('osasuna', p({ id: 'sheraldo-becker', name: 'Sheraldo Becker', birthDate: '1995-02-09', nationality: 'Surinam', position: 'Extremo derecho', height: 180, marketValue: 4, contractUntil: '2028-06-30', shirtNumber: 11, status: 'titular' }))
  movePlayer('takefusa-kubo', 'real-sociedad', 'arsenal', p({ id: 'takefusa-kubo', name: 'Takefusa Kubo', birthDate: '2001-06-04', nationality: 'Japón', position: 'Extremo derecho', height: 173, dominantFoot: 'Izquierdo', marketValue: 45, contractUntil: '2030-06-30', shirtNumber: 19, status: 'suplente' }), { contractUntil: '2030-06-30', shirtNumber: 19, status: 'suplente' })
  upsertPlayer('real-sociedad', p({ id: 'khephren-thuram', name: 'Khéphren Thuram', birthDate: '2001-03-26', nationality: 'Francia', position: 'Mediocentro', height: 192, marketValue: 30, contractUntil: '2030-06-30', shirtNumber: 8, status: 'titular' }))
  upsertPlayer('rayo-vallecano', p({ id: 'fabio-silva', name: 'Fábio Silva', birthDate: '2002-07-19', nationality: 'Portugal', position: 'Delantero centro', height: 185, marketValue: 10, contractUntil: '2029-06-30', shirtNumber: 9, status: 'titular' }))
  movePlayer('mathias-olivera', 'napoli', 'villarreal', null, { contractUntil: '2029-06-30', shirtNumber: 12, status: 'titular' })
  movePlayer('renato-veiga', 'villarreal', 'manchester-city', null, { contractUntil: '2031-06-30', shirtNumber: 24, status: 'suplente' })
  upsertPlayer('villarreal', p({ id: 'rafa-marin', name: 'Rafa Marín', birthDate: '2002-05-19', nationality: 'España', position: 'Defensa central', height: 191, marketValue: 8, contractUntil: '2030-06-30', shirtNumber: 5, status: 'titular' }))

  upsertPlayer('liverpool', p({ id: 'jeremy-jacquet', name: 'Jérémy Jacquet', birthDate: '2005-07-13', nationality: 'Francia', position: 'Defensa central', height: 188, marketValue: 15, contractUntil: '2031-06-30', shirtNumber: 5, status: 'titular' }))
  upsertPlayer('liverpool', p({ id: 'victor-munoz', name: 'Víctor Muñoz', birthDate: '2003-07-13', nationality: 'España', position: 'Extremo izquierdo', height: 173, marketValue: 28, contractUntil: '2031-06-30', shirtNumber: 20 }))
  movePlayer('andy-robertson', 'liverpool', 'tottenham', null, { contractUntil: '2028-06-30', shirtNumber: 3, status: 'titular' })
  movePlayer('marcos-senesi', 'bournemouth', 'tottenham', p({ id: 'marcos-senesi', name: 'Marcos Senesi', birthDate: '1997-05-10', nationality: 'Argentina', position: 'Defensa central', height: 185, dominantFoot: 'Izquierdo', marketValue: 22, contractUntil: '2030-06-30', shirtNumber: 5, status: 'titular' }), { contractUntil: '2030-06-30', shirtNumber: 5, status: 'titular' })
  movePlayer('jan-paul-van-hecke', 'brighton', 'tottenham', p({ id: 'jan-paul-van-hecke', name: 'Jan Paul van Hecke', birthDate: '2000-06-08', nationality: 'Países Bajos', position: 'Defensa central', height: 189, marketValue: 28, contractUntil: '2030-06-30', shirtNumber: 6, status: 'titular' }), { contractUntil: '2030-06-30', shirtNumber: 6, status: 'titular' })
  movePlayer('martin-dubravka', 'newcastle', 'tottenham', p({ id: 'martin-dubravka', name: 'Martin Dúbravka', birthDate: '1989-01-15', nationality: 'Eslovaquia', position: 'Portero', height: 190, marketValue: 1.5, contractUntil: '2027-06-30', shirtNumber: 13 }), { contractUntil: '2027-06-30', shirtNumber: 13 })
  upsertPlayer('tottenham', p({ id: 'marco-asensio', name: 'Marco Asensio', birthDate: '1996-01-21', nationality: 'España', position: 'Mediapunta', height: 182, dominantFoot: 'Izquierdo', marketValue: 18, contractUntil: '2029-06-30', shirtNumber: 14, status: 'titular' }))

  upsertPlayer('chelsea', p({ id: 'geovany-quenda', name: 'Geovany Quenda', birthDate: '2007-04-30', nationality: 'Portugal', position: 'Extremo derecho', height: 172, dominantFoot: 'Izquierdo', marketValue: 45, contractUntil: '2033-06-30', shirtNumber: 17, status: 'titular' }))
  upsertPlayer('chelsea', p({ id: 'emanuel-emegha', name: 'Emanuel Emegha', birthDate: '2003-02-03', nationality: 'Países Bajos', position: 'Delantero centro', height: 195, marketValue: 25, contractUntil: '2032-06-30', shirtNumber: 19 }))
  upsertPlayer('chelsea', p({ id: 'denner', name: 'Denner', birthDate: '2008-02-21', nationality: 'Brasil', position: 'Lateral izquierdo', height: 180, dominantFoot: 'Izquierdo', marketValue: 12, contractUntil: '2033-06-30', shirtNumber: 29, status: 'cantera' }))
  movePlayer('alejandro-garnacho', 'chelsea', 'valencia', null, { contractUntil: '2027-06-30', shirtNumber: 17, status: 'titular' })

  movePlayer('morgan-rogers', 'aston-villa', 'manchester-city', p({ id: 'morgan-rogers', name: 'Morgan Rogers', birthDate: '2002-07-26', nationality: 'Inglaterra', position: 'Mediapunta', height: 189, marketValue: 65, contractUntil: '2031-06-30', shirtNumber: 19, status: 'titular' }), { contractUntil: '2031-06-30', shirtNumber: 19, status: 'titular' })
  movePlayer('adam-wharton', 'crystal-palace', 'manchester-united', p({ id: 'adam-wharton', name: 'Adam Wharton', birthDate: '2004-02-06', nationality: 'Inglaterra', position: 'Mediocentro defensivo', height: 182, marketValue: 50, contractUntil: '2031-06-30', shirtNumber: 6, status: 'titular' }), { contractUntil: '2031-06-30', shirtNumber: 6, status: 'titular' })
  movePlayer('anthony-elanga', 'nottingham-forest', 'newcastle', p({ id: 'anthony-elanga', name: 'Anthony Elanga', birthDate: '2002-04-27', nationality: 'Suecia', position: 'Extremo derecho', height: 178, marketValue: 35, contractUntil: '2030-06-30', shirtNumber: 11, status: 'titular' }), { contractUntil: '2030-06-30', shirtNumber: 11, status: 'titular' })
  movePlayer('koni-de-winter', 'milan', 'newcastle', null, { contractUntil: '2030-06-30', shirtNumber: 4, status: 'titular' })
  upsertPlayer('brighton', p({ id: 'costinha', name: 'Costinha', birthDate: '2000-03-26', nationality: 'Portugal', position: 'Lateral derecho', height: 181, marketValue: 8, contractUntil: '2030-06-30', shirtNumber: 22 }))
  upsertPlayer('brighton', p({ id: 'zadok-oboavwoduo', name: 'Zadok Oboavwoduo', birthDate: '2006-08-15', nationality: 'Inglaterra', position: 'Extremo izquierdo', height: 178, marketValue: 4, contractUntil: '2029-06-30', shirtNumber: 47, status: 'cantera' }))
  upsertPlayer('brentford', p({ id: 'jannik-vestergaard', name: 'Jannik Vestergaard', birthDate: '1992-08-03', nationality: 'Dinamarca', position: 'Defensa central', height: 199, marketValue: 3, contractUntil: '2027-06-30', shirtNumber: 23 }))
  upsertPlayer('crystal-palace', p({ id: 'yeremy-pino', name: 'Yeremy Pino', birthDate: '2002-10-20', nationality: 'España', position: 'Extremo derecho', height: 172, marketValue: 30, contractUntil: '2030-06-30', shirtNumber: 7, status: 'titular' }))
  removePlayer('crystal-palace', 'tyrick-mitchell')
  movePlayer('jose-sa', 'wolves', 'leeds', p({ id: 'jose-sa', name: 'José Sá', birthDate: '1993-01-17', nationality: 'Portugal', position: 'Portero', height: 192, marketValue: 8, contractUntil: '2029-06-30', shirtNumber: 1, status: 'titular' }), { contractUntil: '2029-06-30', shirtNumber: 1, status: 'titular' })
  upsertPlayer('sunderland', p({ id: 'noah-sadiki', name: 'Noah Sadiki', birthDate: '2004-12-17', nationality: 'RD Congo', position: 'Mediocentro defensivo', height: 183, marketValue: 10, contractUntil: '2030-06-30', shirtNumber: 8, status: 'titular' }))
  upsertPlayer('sunderland', p({ id: 'chemsdine-talbi', name: 'Chemsdine Talbi', birthDate: '2005-05-09', nationality: 'Bélgica', position: 'Extremo derecho', height: 175, dominantFoot: 'Izquierdo', marketValue: 8, contractUntil: '2030-06-30', shirtNumber: 11, status: 'titular' }))

  const napoliHojlund = team('napoli').players.find((player) => player.id === 'rasmus-hojlund')
  if (napoliHojlund) {
    napoliHojlund.contractUntil = '2031-06-30'
    napoliHojlund.status = 'titular'
  }

  removePlayer('levante', 'unai-vencedor')
  removePlayer('burnley', 'martin-dubravka')
}

function updateTransfers() {
  const file = path.join(root, 'src', 'data', 'transfers.json')
  const transfers = readJson(file)
  const byId = new Map(transfers.map((transfer) => [transfer.id, transfer]))
  const add = (transfer) => byId.set(transfer.id, transfer)

  const rows = [
    ['tr-bernardo-madrid', 'bernardo-silva', 'manchester-city', null, 'real-madrid', 0, 35, 2026, '2026-07-01', 'Libre tras acabar contrato con el Manchester City. Alta publicada para el Real Madrid 2026/27.'],
    ['tr-konate-madrid-2026', 'ibrahima-konate', 'liverpool', null, 'real-madrid', 0, 55, 0, '2026-07-01', 'Salida a coste cero al terminar contrato con Liverpool.'],
    ['tr-cucurella-madrid', 'marc-cucurella', 'chelsea', null, 'real-madrid', 55, 55, null, '2026-07-01', 'Refuerzo para el lateral izquierdo del Real Madrid.'],
    ['tr-gordon-barcelona', 'anthony-gordon', 'newcastle', null, 'barcelona', 80, 60, null, '2026-07-01', 'Operación de gran impacto para el ataque del Barcelona.'],
    ['tr-lewandowski-atletico', 'robert-lewandowski', 'barcelona', null, 'atletico-madrid', 0, 8, 45, '2026-07-01', 'El Atlético incorpora experiencia ofensiva a coste cero.'],
    ['tr-tyrick-atletico', 'tyrick-mitchell', 'crystal-palace', null, 'atletico-madrid', 0, 25, null, '2026-07-01', 'Libre tras finalizar contrato en Crystal Palace.'],
    ['tr-raspadori-inter-2026', 'giacomo-raspadori', 'atletico-madrid', null, 'inter', 31, 25, 22, '2026-07-01', 'El delantero italiano regresa a la Serie A.'],
    ['tr-kubo-arsenal', 'takefusa-kubo', 'real-sociedad', null, 'arsenal', 50, 45, 6.5, '2026-07-01', 'Traspaso destacado desde la Real Sociedad a la Premier.'],
    ['tr-olivera-villarreal', 'mathias-olivera', 'napoli', null, 'villarreal', 12, 22, 11, '2026-07-01', 'Refuerzo defensivo para el Villarreal.'],
    ['tr-renato-veiga-city', 'renato-veiga', 'villarreal', null, 'manchester-city', 55, 22, null, '2026-07-01', 'El City incorpora un central zurdo procedente del Villarreal.'],
    ['tr-jeremy-jacquet-liverpool', 'jeremy-jacquet', null, 'Stade Rennais', 'liverpool', 48, 15, null, '2026-07-01', 'Liverpool refuerza el eje defensivo.'],
    ['tr-victor-munoz-liverpool', 'victor-munoz', 'osasuna', null, 'liverpool', 34.5, 28, null, '2026-07-01', 'Incorporación ofensiva desde Osasuna.'],
    ['tr-robertson-tottenham', 'andy-robertson', 'liverpool', null, 'tottenham', 10, 16, 9, '2026-07-01', 'Tottenham suma experiencia en el lateral izquierdo.'],
    ['tr-senesi-tottenham', 'marcos-senesi', 'bournemouth', null, 'tottenham', 28, 22, 15, '2026-07-01', 'Central zurdo para el nuevo Tottenham de De Zerbi.'],
    ['tr-vanhecke-tottenham', 'jan-paul-van-hecke', 'brighton', null, 'tottenham', 32, 28, null, '2026-07-01', 'Refuerzo defensivo procedente del Brighton.'],
    ['tr-geovany-quenda-chelsea', 'geovany-quenda', null, 'Sporting CP', 'chelsea', 50, 45, null, '2026-07-01', 'Chelsea adelanta la llegada del extremo portugués.'],
    ['tr-emegha-chelsea', 'emanuel-emegha', null, 'Strasbourg', 'chelsea', 25, 25, null, '2026-07-01', 'Nuevo delantero para Chelsea.'],
    ['tr-denner-chelsea', 'denner', null, 'Corinthians', 'chelsea', 10, 12, null, '2026-07-01', 'Apuesta joven brasileña para la banda izquierda.'],
    ['tr-garnacho-valencia', 'alejandro-garnacho', 'chelsea', null, 'valencia', 0, 45, null, '2026-07-01', 'Cesión ofensiva al Valencia.'],
    ['tr-morgan-rogers-city', 'morgan-rogers', 'aston-villa', null, 'manchester-city', 75, 65, 9.4, '2026-07-01', 'El City incorpora una pieza diferencial de la Premier.'],
    ['tr-adam-wharton-united', 'adam-wharton', 'crystal-palace', null, 'manchester-united', 60, 50, 21, '2026-07-01', 'Manchester United refuerza la sala de máquinas.'],
    ['tr-elanga-newcastle', 'anthony-elanga', 'nottingham-forest', null, 'newcastle', 55, 35, 17.5, '2026-07-01', 'Newcastle suma velocidad por banda.'],
    ['tr-koni-newcastle', 'koni-de-winter', 'milan', null, 'newcastle', 22, 20, null, '2026-07-01', 'Central belga para Newcastle.'],
    ['tr-canales-racing', 'sergio-canales', null, 'Monterrey', 'racing-santander', 0, 6, null, '2026-06-22', 'Regreso simbólico de Sergio Canales al Racing en su vuelta a Primera.'],
    ['tr-ngonge-espanyol', 'cyril-ngonge', 'napoli', null, 'espanyol', 8, 8, null, '2026-07-01', 'Espanyol refuerza la banda derecha.'],
    ['tr-morata-espanyol', 'alvaro-morata', 'milan', null, 'espanyol', 0, 8, null, '2026-07-01', 'Incorporación veterana para el ataque del Espanyol.'],
  ]

  for (const [id, playerId, fromClubId, fromClubName, toClubId, transferFee, marketValueAtTransfer, previousPurchaseFee, transferDate, notes] of rows) {
    add({
      id,
      playerId,
      fromClubId,
      ...(fromClubName ? { fromClubName } : {}),
      toClubId,
      transferFee,
      marketValueAtTransfer,
      previousPurchaseFee,
      transferDate,
      status: 'confirmado',
      sources: ['src-as', 'src-wikipedia'],
      notes: `${notes} Actualizado a 27/06/2026.`,
    })
  }

  writeJson(file, Array.from(byId.values()).sort((a, b) => new Date(a.transferDate) - new Date(b.transferDate)))
}

function saveTeams() {
  for (const [id, data] of teams) {
    writeJson(teamFiles.get(id), data)
  }
}

loadTeams()
ensureSources()
updateLeagueCompositionAndCoaches()
addPromotedTeams()
updateSquads()
updateTransfers()
saveTeams()
