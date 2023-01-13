import { flux as Flux, fluxDispatcher as FluxDispatcher } from "replugged/common";
import { Endpoints } from "./constants";

const SOURCE = `Replugged/4.0.0-beta0.20, Discord/${GLOBAL_ENV.RELEASE_CHANNEL}`

// map of loaded pronouns
const pronounsMap = new Map()
// pronouns[id] == undefined means we don't know if that id has pronouns
//              == false     the user's pronouns are "unspecified"
//              == string    the user's pronouns key (2 letters)

// list of user ids currently being fetched
const requestedPronouns = new Set()
// list of user ids to be fetched in the next batch
const fetchBuffer = new Set()
let fetchTimeout = false


// technically not a restart, just ensures it's running
function restartFetchTimeout() {
  if(!fetchTimeout) {
    fetchTimeout = setTimeout(() => {
      fetchPronouns([...fetchBuffer])
      fetchBuffer.clear()
      fetchTimeout = false
    }, 50)
  }
}


// triggered by timeout
async function fetchPronouns(ids) {
  ids.forEach(id => requestedPronouns.add(id))

  const res = await fetch(ids.length > 1 ? Endpoints.LOOKUP_BULK(ids) : Endpoints.LOOKUP(ids[0]))

  if(!res.ok) {
    if([429, 500, 503].includes(res.status)) {
      logger.warn(`fetch retry: ${res.status} ${res.statusText}`, res)

      // try to parse for a Retry-After header (currently not present but i didn't notice until i already wrote this)
      let retryMs = Number.parseInt(res.headers.get("retry-after")) * 1000
      if(isNaN(retryMs)) retryMs = (Date.parse(res.headers.get("retry-after")) - new Date())
      if(isNaN(retryMs)) retryMs = 15e3

      // re-request these ids
      setTimeout(() => fetchPronouns(ids), retryMs)

    } else {
      logger.warn(`fetch for ${ids} failed: ${res.status} ${res.statusText}`, res)
      ids.forEach(id => {
        pronounsMap.set(id, false)
      })
    }
    return
  }

  let data = await res.json()

  for(let [id, pronouns] of Object.entries(data)) {
    if(id === "pronouns") id = ids[0] // for non-batched requests
    // postprocess returned pronouns
    if(pronouns === "unspecified") pronouns = false
    // store them
    pronounsMap.set(id, pronouns)
    // and notify connected components that the pronouns are available
    FluxDispatcher.dispatch({
      type: 'PRONOUNDB_PRONOUNS_LOADED',
      id: id,
      loadedPronouns: pronouns
    })
  }
}

class PronounDBStore extends Flux.Store {
  // ensure we have the user's pronouns
  async usePronouns(id) {
    if(!pronounsMap.has(id) && !requestedPronouns.has(id)) {
      fetchBuffer.add(id)
      restartFetchTimeout()
    }
  }

  // simply try to get the user's pronouns, returning nothing if we haven't fetched them yet
  getPronouns(id) {
    return pronounsMap.get(id)
  }

  // thing for Discord's devtools (ctrl+alt+O)
  __getLocalVars() {
    return { pronounsMap, requestedPronouns, fetchBuffer, SOURCE }
  }
}

export default new PronounDBStore(FluxDispatcher, {
  ['PRONOUNDB_PRONOUNS_LOADED']: () => void 0 // must be a callable value to have dispatches work
})
