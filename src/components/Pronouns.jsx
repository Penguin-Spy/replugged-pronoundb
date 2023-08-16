import { React, flux as Flux, users } from "replugged/common";
import pronounDBStore from "../pronounDBStore.js";
import discordPronouns from "../discordPronouns.js"


function Pronouns({ user_id, guild_id, pronounDB_pronouns, discord_pronouns, compact }) {
  // only fetch pronouns when rendered for a different user
  React.useEffect(() => void pronounDBStore.usePronouns(user_id), [user_id])

  // this conditional hook doesn't crash for some reason? (epic?) (even if it did it'd only be when changing the setting)
  const mode = settings.get("show_discord_pronouns")
  if(mode !== "never") {
    React.useEffect(() => void discordPronouns.usePronouns(user_id, guild_id), [user_id, guild_id])
  }

  // must be after both hooks
  if(!settings.get("show_own_pronouns") && user_id === users.getCurrentUser().id) return null

  let discord, pronounDB

  // create the Discord pronouns span if both will be displayed, the Discord ones are prioritized, or PronounDB isn't present
  if(discord_pronouns && (mode === "both" || mode === "discord" || (mode === "pronoundb" && !pronounDB_pronouns))) {
    discord = (<span
      className="pronoundb-pronouns pronoundb-discord"
      data-compact={compact}
      data-hover={settings.get("hover")}
      data-format={settings.get("format_discord_pronouns") ? settings.get("format") : null}>
      {discord_pronouns}
    </span>)
  }

  // create the PronounDB span if both are displayed or Discord's don't exist
  if(pronounDB_pronouns && (!discord || mode === "both")) {
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
  [pronounDBStore, discordPronouns.UserProfileStore], // stores to pay attention to
  // props modifier: called with given props, returns additional props to be provided to the component
  ({ user_id, guild_id }) => ({
    pronounDB_pronouns: pronounDBStore.getPronouns(user_id), // this could also just be in Pronouns, but it's better style to be here (i think, lol)
    discord_pronouns: discordPronouns.getPronouns(user_id, guild_id)
  })
)(React.memo(Pronouns)) // call return value of connectStores with the component to attach store & props modifer to
