import { Injector, webpack, Logger, settings as SettingsManager } from "replugged"
import { React } from "replugged/common"

import Pronouns from "./components/Pronouns.jsx"
import { DefaultSettings, PLUGIN_ID } from "./constants.js"
import "./style.css"

import { Settings } from "./components/Settings.jsx";
export { Settings };

const inject = new Injector()
const logger = Logger.plugin("PronounDB")
const settings = await SettingsManager.init(PLUGIN_ID, DefaultSettings)

export async function start() {
  // pronouns in message header
  if(settings.get("show_in_chat")) {
    webpack.waitForModule(webpack.filters.byProps("UsernameDecorationTypes"))
      .then(MessageHeaderUsername => {
        inject.after(MessageHeaderUsername, "default", ([props], res) => {
          if(props.message.author.bot) { return } // bots can never have pronouns (transphobic?), and trying to render them makes an invalid API call to Discord
          const headerItems = res.props.children

          // this is hidden with css when in a reply or in compact mode (until hovered)
          const pronouns = React.createElement(Pronouns, { user_id: props.message.author.id, guild_id: props.channel?.guild_id, compact: props.compact, pronounDB: true })

          const insertIndex = headerItems.findIndex(e => e?.props?.pronounDBCompat)
          if(insertIndex > 0 && headerItems[insertIndex].props.pronounDBCompat === "pronoundb") {
            headerItems.splice(insertIndex, 0, pronouns)
          } else {
            headerItems.push(pronouns)
          }
          return res
        })
      })
  }
}

export function stop() {
  inject.uninjectAll();
}
