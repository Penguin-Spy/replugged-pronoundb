import { React, flux as Flux } from "replugged/common";
import pronounDBStore from "../pronounStore.js";
import { Pronouns as PronounStrings } from "../constants.js";

function Pronouns({ userId, pronouns: userPronouns, compact }) {
  // only fetch pronouns when rendered for a different user
  React.useEffect(() => void pronounDBStore.fetchPronouns(userId), [userId])

  // pronouns not loaded or no pronouns set
  if(!userPronouns) return null

  return React.createElement("span", { className: "pronoundb-pronouns", "data-compact": compact },
    React.createElement(React.Fragment, null, PronounStrings[userPronouns] + '  • ')
  )
}

export default Flux.connectStores(
  [pronounDBStore], // stores to pay attention to
  // props modifier: called with given props, returns additional props to be provided to the component
  ({ userId }) => ({
    pronouns: pronounDBStore.getPronouns(userId) // this could also just be in Pronouns, but it's better style to be here (i think, lol)
  })
)(React.memo(Pronouns)) // call return value of connectStores with the component to attach store & props modifer to
