# Cover Block Parallax Style

Adds a smooth parallax scrolling effect to the WordPress Cover block with adjustable speed controls.

## Features

- **Parallax Background Toggle**: Enable parallax scrolling on any Cover block
- **Speed Control**: Choose from 5 preset speeds or set a custom value (0.1 - 1.0)
- **Per-Block Mobile Control**: Optionally disable parallax on mobile for individual blocks
- **Editor Preview**: See the parallax effect in real-time while editing
- **Accessibility**: Respects `prefers-reduced-motion` user preference
- **Performance Optimized**: Footer-loaded script, GPU-accelerated transforms, viewport culling, passive event listeners
- **Mutual Exclusivity**: Automatically disables "Fixed background" when parallax is enabled

## Requirements

- WordPress 6.0 or higher
- PHP 7.4 or higher

## Installation

### From GitHub Release (recommended)

1. Download `cover-parallax-style.zip` from the [latest release](https://github.com/dhanson-wp/cover-block-parallax/releases/latest)
2. In WordPress, go to **Plugins > Add New > Upload Plugin**
3. Upload the zip file and activate

### Manual

1. Upload the `cover-parallax-style` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress

## Usage

1. Add or select a Cover block
2. In the Settings panel, enable "Parallax background"
3. Adjust the speed using the preset slider (1-5) or click the settings icon to enter a custom value
4. Lower values (1) create a subtle effect, higher values (5) create more dramatic movement
5. Optionally toggle "Disable on mobile" to turn off parallax for that block on smaller screens

## How It Works

The plugin uses JavaScript-based parallax with CSS transforms for smooth, reliable scrolling:

- Background images are sized at 140% height with -20% top offset to allow movement room
- `requestAnimationFrame` ensures 60fps smooth animations
- The effect is calculated based on viewport position for natural depth perception
- GPU acceleration via `will-change: transform` and `backface-visibility: hidden`

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run start
```

### Linting

```bash
npm run lint:js
npm run lint:css
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run `npm install` and `npm run build` to set up locally
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full release history.

## License

This plugin is free software released under the terms of the GNU General Public License version 2 or (at your option) any later version. See [LICENSE](LICENSE) for full license text.

This is the same license used by WordPress itself, ensuring full compatibility with the WordPress ecosystem.
