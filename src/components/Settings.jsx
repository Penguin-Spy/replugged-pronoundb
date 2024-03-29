import { util } from "replugged";
import { SwitchItem, SelectItem, Notice } from "replugged/components";
import { DropdownSettings } from "../constants.js";

export function Settings() {
  return (
    <div>
      <Notice messageType={Notice.Types.INFO} className="pronoundb-settings-notice">To change your pronouns, visit <a target="_blank" href="https://pronoundb.org/me">pronoundb.org/me</a></Notice>
      <SelectItem
        note="lowercase: 'they/them', pascal: 'They/Them'"
        options={DropdownSettings.format}
        {...util.useSetting(settings, "format")}>
        Pronoun capitalization
      </SelectItem>
      <SwitchItem
        note="When off, your pronouns will not be shown on your screen. They will still be visible to other users."
        {...util.useSetting(settings, "show_own_pronouns")}>
        Show own pronouns
      </SwitchItem>
      <SwitchItem
        note="Show pronouns above messages next to the username. Requires reloading the plugin to change."
        {...util.useSetting(settings, "show_in_chat")}>
        Show pronouns in chat
      </SwitchItem>
      <SelectItem
        note="Which pronouns to show if both Discord's and PronounDB's are present."
        options={DropdownSettings.show_discord_pronouns}
        {...util.useSetting(settings, "show_discord_pronouns")}>
        Show Discord pronouns
      </SelectItem>
      <SwitchItem
        note="Applies your pronoun capitalization setting to user's Discord pronouns as well."
        {...util.useSetting(settings, "format_discord_pronouns")}>
        Format Discord pronouns
      </SwitchItem>
      <SelectItem
        note="When to require hovering over the username to show pronouns."
        options={DropdownSettings.hover}
        {...util.useSetting(settings, "hover")}>
        Hover mode
      </SelectItem>
    </div>
  );
}
