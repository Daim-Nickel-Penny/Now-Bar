# Now Bar

The other day I saw [Claude FM](https://www.youtube.com/watch?v=tRsQsTMvPNg) on YouTube and wondered how they made that ASCII videos. Curiosity led me to [asciify](https://asciify.org/). Then I built this simple Chrome extension to play with ASCII art.

It shows what you are listening to in a small window that stays on top. Works with YouTube Music and Spotify in the browser. You get the track, playback controls, volume, and a looping ASCII scene with an axolotl :) Nothing is sent off your machine.

## Demo

https://github.com/user-attachments/assets/ca8b730c-4027-4d9f-b500-42fd71431205

## Requirements

- Chrome 116 or newer, on a desktop
- [Node.js](https://nodejs.org) 20 or newer, to build
- Music playing in a browser tab, not the Spotify or YouTube phone/desktop apps

## Install

From the project folder:

```bash
npm install
npm run build
```

Then load it in Chrome:

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist` folder — not the project root

After you change code, run `npm run build` again, then click **Reload** on the extension card.

## Use

1. Open [YouTube Music](https://music.youtube.com) or [Spotify](https://open.spotify.com) and press play.
2. The floating window should open by itself.
3. If it does not, click the small **Now Bar** pill at the bottom right of the page. Chrome only lets this window open after a click on the music tab. The **×** on the pill hides it until the next track.

Click the toolbar icon to see what is playing and to change settings.

Closing the window keeps it closed. It will not reopen on its own until you use the pill or **Open floater** in the popup.

In the floating window:

| Control                | What it does                                                |
| ---------------------- | ----------------------------------------------------------- |
| Previous / play / next | Same as the buttons on the music page                       |
| Mute / slider          | Quiet the music tab. Arrow up / down also nudge. Not stored |
| Scene icon             | Next scene. The icon is the scene you are on                |
| Dash                   | Shrink: card → pill → icon                                  |
| Icon                   | Expand back to the card                                     |
| Close                  | Close the window                                            |

Drag the window's edge to resize it. The card remembers the size you leave it at.

Chrome draws the title bar on this kind of window. There is no way for an extension to hide or restyle it. Drag the window by that bar.

## Settings

These live on the toolbar popup and stay on this computer.

| Setting      | What it does                                                                        |
| ------------ | ----------------------------------------------------------------------------------- |
| Open on play | Open the window when a track starts                                                 |
| Cycle scenes | Rotate through the checked scenes about every 40 seconds. Off holds the current one |
| ASCII style  | **Dots** or **Glyphs** for the scene                                                |
| Opens as     | Start as a **card**, **pill**, or **icon**                                          |
| Scenes       | Which scenes can play: Hearth, Rainy window, Disco, Rooftop night, Arcade, Kitchen  |

## Privacy

The extension only reads the player bar on `music.youtube.com` and `open.spotify.com`: title, artist, album, artwork, and whether something is playing. It can press that tab's playback and mute buttons and change that tab's volume. Those two sites are the only ones it asks for access to. Volume is not saved.

It does not see other tabs, cookies, or your account. It does not call home, collect analytics, or save the track name.

See [docs/privacy.md](docs/privacy.md).

## Contribute

Want to add a scene? [docs/add-a-scene.md](docs/add-a-scene.md) is the recipe. Security, privacy, and how we keep the window light are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Develop

```bash
npm run build       # write dist/
npm run watch       # rebuild on save
npm test            # tests
npm run typecheck   # TypeScript
npm run lint        # lint
```

Source is in `src/`. The build writes `dist/`. Icons come from `assets/logo.png`. Docs index: [docs/README.md](docs/README.md).

## License

[MIT](LICENSE)
