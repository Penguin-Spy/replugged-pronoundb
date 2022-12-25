import { flux as Flux, fluxDispatcher as FluxDispatcher } from "replugged/common";
import { Endpoints } from "./constants";

// list of loaded pronouns
const pronounsList = {}
// pronouns[id] == undefined means we don't know if that id has pronouns
//              == false     the user's pronouns are "unspecified"
//              == string    the user's pronouns key (2 letters)

// list of pronouns currently being fetched
const requestedPronouns = {}
// requestedPronouns[id] == boolean
// this is necessary to prevent duplicate GET requests

const SOURCE = `Replugged/4.0.0-beta0.18, Discord/${GLOBAL_ENV.RELEASE_CHANNEL}`

class PronounDBStore extends Flux.Store {
  // ensure we have the user's pronouns
  async fetchPronouns(id) {
    // if we already have the pronouns or are already fetching it, do nothing
    if(id in pronounsList || id in requestedPronouns) return;

    // otherwise, start an asynchronous request for the users pronouns
    requestedPronouns[id] = true;
    // todo: wait for all effects to happen & then do a bulk lookup
    let pronouns = await fetch(Endpoints.LOOKUP(id), { headers: { "x-pronoundb-source": SOURCE } })
      .then(r => r.json()).then(r => r.pronouns)
      .catch((err) => {
        if(err.statusCode != 404) console.warn(`[pronounDB] fetch for ${id} failed:`, err)
        return // won't re-request, & stores undefined instead of false
      })

    // postprocess returned pronouns
    if(pronouns === "unspecified") pronouns = false

    // store them
    pronounsList[id] = pronouns

    // and notify connected components that the pronouns are available
    FluxDispatcher.dispatch({
      type: 'PRONOUNDB_PRONOUNS_LOADED',
      id: id,
      loadedPronouns: pronouns
    })
  }

  // simply try to get the user's pronouns, returning nothing if we haven't fetched them yet
  getPronouns(id) {
    return pronounsList[id]
  }

  // thing for Discord's devtools (ctrl+alt+O)
  __getLocalVars() {
    return { pronounsList, requestedPronouns, SOURCE }
  }
}

export default new PronounDBStore(FluxDispatcher, {
  ['PRONOUNDB_PRONOUNS_LOADED']: () => void 0 // must be a callable value to have dispatches work
})
