import { util } from "replugged";
import { SwitchItem } from "replugged/components";

export function Settings() {
  return (
    <div>
      <SwitchItem
        note="If a divider has no roles under it, it will be hidden."
        {...util.useSetting(cfg, "hideEmpty")}>
        Hide empty dividers
      </SwitchItem>
      <SwitchItem
        note='If enabled, you can collapse dividers by clicking on" them. This will hide all roles under
        the divider.'
        {...util.useSetting(cfg, "enableCollapse")}>
        Enable collapsing
      </SwitchItem>
    </div>
  );
}
