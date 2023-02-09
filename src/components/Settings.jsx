import { util } from "replugged";
import { SwitchItem, SelectItem } from "replugged/components";
import { DropdownSettings } from "../constants.js";

export function Settings() {
  return (
    <div>
      <SelectItem
        note="When to require hovering over the username to show pronouns."
        options={DropdownSettings.hover}
        {...util.useSetting(settings, "hover")}>
        Hover mode
      </SelectItem>
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
    </div>
  );
}
