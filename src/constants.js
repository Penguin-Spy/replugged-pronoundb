const WEBSITE = 'https://pronoundb.org'

const Endpoints = Object.freeze({
  LOOKUP: (id) => `${WEBSITE}/api/v1/lookup?platform=discord&id=${id}`,
  LOOKUP_BULK: (ids) => `${WEBSITE}/api/v1/lookup-bulk?platform=discord&ids=${ids.join(',')}`
})

const Pronouns = Object.freeze({
  // -- list is sorted alphabetically
  hh: 'he/him',
  hi: 'he/it',
  hs: 'he/she',
  ht: 'he/they',
  ih: 'it/him',
  ii: 'it/its',
  is: 'it/she',
  it: 'it/they',
  shh: 'she/he',
  sh: 'she/her',
  si: 'she/it',
  st: 'she/they',
  th: 'they/he',
  ti: 'they/it',
  ts: 'they/she',
  tt: 'they/them',
  // --
  any: 'Any pronouns',
  other: 'Other pronouns',
  ask: 'Ask me my pronouns',
  avoid: 'Avoid pronouns, use my name',
})

export {
  WEBSITE,
  Endpoints,
  Pronouns
}
