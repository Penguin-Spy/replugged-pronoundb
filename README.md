# THIS IS NOT THE OFFICIAL PLUGIN TEMPLATE
you should [use the real one instead](https://github.com/replugged-org/plugin-template)!!

---

This is an unofficial template for [replugged](https://github.com/replugged-org/replugged) plugins,
**without** Typescript support or linting!  
it still supports bundling the plugin into an `.asar` and installing it into Replugged automatically when files change.

this was created for personal use because:
- i hate the computer telling me what code i can and can't write
- trying to type a Discord mod is fundamentally flawed and annoying
- idk it sounded kinda fun

## Prerequisites
- NodeJS
- pnpm: `npm i -g pnpm`
- [Replugged](https://github.com/replugged-org/replugged#installation)

## Install
1. [Create a copy of this template](https://github.com/penguin-spy/replugged-plugin-template/generate)
2. Clone your new repository and cd into it
3. Install dependencies: `pnpm i`
4. Edit the `manifest.json` and change at least the `"id"` to be something different!
4. Install the plugin into Replugged: `pnpm run update`
5. Reload Discord to load the plugin

The unmodified plugin will log "Typing prevented" in the console when you start typing in any channel.

## Development
Official Replugged API docs: https://docs.replugged.dev/modules.html (have fun)  

`pnpm run update` will copy the plugin into the [Replugged plugins folder](https://github.com/replugged-org/replugged#installing-plugins-and-themes).  
`pnpm run watch` will do this automatically whenever a file changes (you still have to reload Discord)

## Distribution
`pnpm run bundle` will create an `.asar` of the plugin that's ready for distributing via the [#plugin-links](https://discord.com/channels/1000926524452647132/1053466391874900078) 
channel, GitHub releases, email, FTP, dial-up modem, or USB drive + carrier pigeon.

This template includes a GitHub workflow that bundles the plugin and releases the `.asar`.
To trigger it, push a tag with the version number preceded by a v (e.g. v1.0.0):
```
git tag v1.0.0
git push --tags
```

The Replugged updater (coming soon™) will automatically check for updates on the repository specified
in the manifest. Make sure to update it to point to the correct repository!

