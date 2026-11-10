export const GLORIA_PRIORITY_TRACKS = [
  'God knows...',
  'ハレ晴レユカイ',
  '冒険でしょでしょ？',
  'Lost my music',
  'Super Driver',
  '止マレ！',
  '最強パレパレード',
  'First Good-Bye',
  '恋のミクル伝説',
  '雪、無音、窓辺にて。',
] as const

export const GLORIA_TRACKS = [
  'God knows...',
  'ハレ晴レユカイ',
  '冒険でしょでしょ？',
  'Lost my music',
  'Super Driver',
  '止マレ！',
  '最強パレパレード',
  'First Good-Bye',
  '恋のミクル伝説',
  '雪、無音、窓辺にて。',
  'SELECT?',
  'COOL EDITION',
  '倦怠ライフ・リターンズ！',
  'パラレル Days',
  '世界が夢見るユメノナカ',
  '風読みリボン',
  '運命的事件の幸福',
  'Welcome UNKNOWN',
  'Punkish regular',
  'SOSならだいじょーぶ',
] as const

let sessionSeed: number | null = null

function getSessionSeed(): number {
  if (sessionSeed !== null)
    return sessionSeed

  const random = new Uint32Array(1)
  globalThis.crypto?.getRandomValues?.(random)
  sessionSeed = random[0] || Date.now()
  return sessionSeed
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function assignUniqueGloriaTracks(nodeIds: string[]): Map<string, string> {
  const sortedNodeIds = [...new Set(nodeIds)].sort((a, b) => a.localeCompare(b))
  const priorityTracks = new Set<string>(GLORIA_PRIORITY_TRACKS)
  const otherTracks = GLORIA_TRACKS.filter(track => !priorityTracks.has(track))
  const random = createRandom(getSessionSeed())

  for (let index = otherTracks.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1))
    const currentTrack = otherTracks[index]!
    otherTracks[index] = otherTracks[target]!
    otherTracks[target] = currentTrack
  }

  const tracks = [...GLORIA_PRIORITY_TRACKS, ...otherTracks]

  return new Map(sortedNodeIds.map((nodeId, index) => [
    nodeId,
    tracks[index % tracks.length]!,
  ]))
}
