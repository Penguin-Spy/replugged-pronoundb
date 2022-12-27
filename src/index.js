import { Injector, webpack, Logger, settings as SettingsManager } from "replugged";
import { React } from "replugged/common";

import Pronouns from "./components/Pronouns.js";
import { DefaultSettings } from "./constants.js";
import "./style.css"

const PLUGIN_ID = "dev.penguinspy.pronoundb"
const inject = new Injector();
const logger = new Logger("Plugin", PLUGIN_ID);
const settings = await SettingsManager.init(PLUGIN_ID)

export async function start() {
  for(const [key, value] of Object.entries(DefaultSettings)) {
    if(!settings.has(key)) {
      logger.log(`Adding new setting ${key} with value`, value);
      settings.set(key, value);
    }
  }

  // pronouns in message header
  webpack.waitForModule(webpack.filters.bySource(/.=.\.renderPopout,.=.\.decorations,/))
    .then(MessageHeaderUsername => {
      const functionKey = Object.entries(MessageHeaderUsername).find(e => typeof e[1] === "function")[0]

      inject.after(MessageHeaderUsername, functionKey, ([props], res) => {
        // this is hidden with css when in a reply or in compact mode (until hovered)
        res.props.children.push(
          React.createElement(Pronouns, { userId: props.message.author.id, compact: props.compact, settings })
        )
        return res
      })
    })
}

export function stop() {
  inject.uninjectAll();
}
