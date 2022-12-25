import { Injector, webpack, Logger } from "replugged";
import { React } from "replugged/common";

import Pronouns from "./components/Pronouns.js";
import "./style.css"

const inject = new Injector();

export async function start() {
  // pronouns in message header
  webpack.waitForModule(webpack.filters.bySource(/.=.\.renderPopout,.=.\.decorations,/))
    .then(MessageHeaderUsername => {
      const functionKey = Object.entries(MessageHeaderUsername).find(e => typeof e[1] === "function")[0]

      inject.after(MessageHeaderUsername, functionKey, ([props], res) => {
        // this is hidden with css when in a reply or in compact mode (until hovered)
        res.props.children.push(
          React.createElement(Pronouns, { userId: props.message.author.id, compact: props.compact })
        )
        return res
      })
    })
}

export function stop() {
  inject.uninjectAll();
}
