import { webpack, util } from "replugged";
import { SwitchItem } from "replugged/components";
import { DropdownSettings } from "../constants.js";

const mod = webpack.getBySource(/.\.options,.=.\.placeholder/)
const DropdownMenu = webpack.getFunctionBySource(/.\.options,.=.\.placeholder/, mod)

function useDropdownSetting(settings, key) {
  const initial = settings.get(key);
  const [value, setValue] = React.useState(initial);

  return {
    value,
    isSelected: (compareValue) => {
      return compareValue === value
    },
    onSelect: (newValue) => {
      setValue(newValue);
      settings.set(key, newValue);
    },
  };
}

function DropdownMenuItem(props) {
  function serialize(value) { return value } // not relevant but DropdownMenu calls it

  // todo: this is bad and dumb and will break,
  //  figure out how to mimic discord's settings stuff
  const res = SwitchItem({
    note: props.note, children: props.children
  })
  res.props.children[0].props.children.props.children[1] = (
    <DropdownMenu
      options={props.options}
      isSelected={props.isSelected}
      select={props.onSelect}
      serialize={serialize}>
    </DropdownMenu>
  );

  return res
}

export function Settings() {
  return (
    <div>
      <DropdownMenuItem
        note="When to require hovering over the username to show pronouns."
        options={DropdownSettings.hover}
        {...useDropdownSetting(settings, "hover")}>
        Hover mode
      </DropdownMenuItem>
      <DropdownMenuItem
        note="lowercase: 'they/them', pascal: 'They/Them'"
        options={DropdownSettings.format}
        {...useDropdownSetting(settings, "format")}>
        Pronoun capitalizatoin
      </DropdownMenuItem>
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
