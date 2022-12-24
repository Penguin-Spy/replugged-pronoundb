import { Injector, webpack, Logger } from "replugged";
// import { React, flux as Flux, fluxDispatcher as FluxDispatcher } from "replugged/common";
// import thing from "./stuff.js"
import "./style.css"

const inject = new Injector();
const logger = new Logger("Plugin", "dev.username.PluginTemplate");

export async function start() {
  const typingMod = await webpack.waitForModule(webpack.filters.byProps("startTyping"));
  const getChannelMod = await webpack.waitForModule(webpack.filters.byProps("getChannel"));

  if(typingMod && getChannelMod) {
    inject.instead(typingMod, "startTyping", ([channel]) => {
      const channelObj = getChannelMod.getChannel(channel);
      logger.log(`Typing prevented! Channel: #${channelObj?.name ?? "unknown"} (${channel}).`);
    });
  }
}

export function stop() {
  inject.uninjectAll();
}
