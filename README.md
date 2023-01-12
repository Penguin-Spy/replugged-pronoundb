[![downloads](https://img.shields.io/github/downloads/Penguin-Spy/replugged-pronoundb/latest/total?color=ff69b4&logo=github)](https://github.com/Penguin-Spy/replugged-pronoundb/releases/latest/download/dev.penguinspy.pronoundb.asar) [![Replugged](https://img.shields.io/badge/client-Replugged-7289da?logo=discord&logoColor=fff)](https://replugged.dev/)  
# PronounDB for Replugged
Shows users' [PronounDB](https://pronoundb.org) pronouns in chat so that you don't accidentally misgender people.

# Features
- Shows pronouns in the message header next to the username.
### planned features
- use bulk lookup endpoint to fix ratelimiting (sorry for spamming your api Cynthia)
- Show pronouns in the user popout/modal.
- More settings for customization (not displaying your pronouns, showing in popout/modal)
- Locally setting pronouns for other users who don't have a PronounDB account.

# Settings
Since Replugged is currently in beta, settings must be configured using DevTools:
```js
// Always run this first line to load the settings
PronounDB = await replugged.settings.init("dev.penguinspy.pronoundb")
// Then run one of the following lines to choose each setting:

/* when to hide pronouns until the username is hovered */
PronounDB.set("hover", "compact") // only in compact mode (default)
PronounDB.set("hover", "never")   // always show pronouns
PronounDB.set("hover", "always")  // always hide until hovered

/* pronoun capitalization format */
PronounDB.set("format", "lowercase") // all lowercase: they/them (default)
PronounDB.set("format", "pascal")    // pascal case: They/Them
```

# Known Issues
None, if you encounter any issues *with the features that are curently implemented*, [please open a GitHub issue](https://github.com/Penguin-Spy/replugged-pronoundb/issues).

# Installation
## Replugged
[Download the latest .asar](https://github.com/Penguin-Spy/replugged-pronoundb/releases/latest/download/dev.penguinspy.pronoundb.asar) and copy it to [your plugins folder](https://github.com/replugged-org/replugged#installing-plugins-and-themes).

### Other client mods
There's also [Juby210's PronounDB plugin](https://github.com/Juby210/Aliucord-plugins#pronoundb) for the Java version of [Aliucord](https://github.com/Aliucord/Aliucord "A Discord mod for Android"). (not affiliated)

# Legal
Licensed under MIT. Copyright (c) 2022 Penguin_Spy

This plugin is not mantained, endorsed by or in any way affiliated with pronoundb.org or Cynthia!  
