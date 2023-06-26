import { plugins } from "replugged/plugins";
const PLUGIN_ID = "dev.penguinspy.pronoundb"

const manifest = plugins.get(PLUGIN_ID).manifest
const SOURCE = `${PLUGIN_ID}/${manifest.version}  Replugged/${RepluggedNative.getVersion()}`

const WEBSITE = 'https://pronoundb.org'
const LOOKUP = (ids) => `${WEBSITE}/api/v2/lookup?platform=discord&ids=${ids.join(',')}`


const DefaultSettings = Object.freeze({
  hover: "compact",
  format: "lowercase",
  show_discord_pronouns: "pronoundb",
  show_own_pronouns: true,
  show_in_chat: true
})

const DropdownSettings = Object.freeze({
  hover: [
    { label: "Compact", value: "compact" },
    { label: "Always", value: "always" },
    { label: "Never (always show)", value: "never" }
  ],
  format: [
    { label: "Lowercase", value: "lowercase" },
    { label: "Pascal", value: "pascal" }
  ],
  show_discord_pronouns: [
    { label: "Both", value: "both" },
    { label: "Prioritize PronounDB", value: "pronoundb" },
    { label: "Prioritize Discord", value: "discord" },
    { label: "Never", value: "never" }
  ]
})


export {
  WEBSITE,
  SOURCE,
  LOOKUP,
  DefaultSettings,
  DropdownSettings
}
