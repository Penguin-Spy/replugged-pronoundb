import { React, flux as Flux, users } from "replugged/common";
import { getByProps } from "replugged/webpack";
import pronounDBStore from "../pronounStore.js";

const { getUserProfile, getGuildMemberProfile } = getByProps("getUserProfile")

function Pronouns({ user_id, guild_id, pronouns: pronounDB_pronouns, compact }) {
  // only fetch pronouns when rendered for a different user
  React.useEffect(() => void pronounDBStore.usePronouns(user_id), [user_id])

  if(!settings.get("show_own_pronouns") && user_id === users.getCurrentUser().id) return null

  const mode = settings.get("show_discord_pronouns")
  let discord, pronounDB

  // try to load the user's Discord pronouns if both will be displayed, the Discord ones are prioritized, or PronounDB isn't present
  if(mode === "both" || mode === "discord" || (mode === "pronoundb" && !pronounDB_pronouns)) {
    // get the guild member pronouns, or the user's global pronouns if the guild ones don't exist (are the empty string or the profile is undefined)
    const discord_pronouns = getGuildMemberProfile(user_id, guild_id)?.pronouns || getUserProfile(user_id)?.pronouns
    if(discord_pronouns) {
      discord = (<span
        className="pronoundb-pronouns pronoundb-discord"
        data-compact={compact}
        data-hover={settings.get("hover")}
        data-format={settings.get("format_discord_pronouns") ? settings.get("format") : null}>
        {discord_pronouns}
      </span>)
    }
  }

  // create the PronounDB span if both are displayed or Discord's don't exist
  if((!discord || mode === "both") && pronounDB_pronouns) {
    pronounDB = (<span
      className="pronoundb-pronouns"
      data-compact={compact}
      data-hover={settings.get("hover")}
      data-format={settings.get("format")}>
      {pronounDB_pronouns}
    </span>)
  }

  return [pronounDB, discord]
}

export default Flux.connectStores(
  [pronounDBStore], // stores to pay attention to
  // props modifier: called with given props, returns additional props to be provided to the component
  ({ user_id }) => ({
    pronouns: pronounDBStore.getPronouns(user_id) // this could also just be in Pronouns, but it's better style to be here (i think, lol)
  })
)(React.memo(Pronouns)) // call return value of connectStores with the component to attach store & props modifer to
