# Cover Block Parallax Style

Adds a smooth parallax scrolling effect to the WordPress Cover block with adjustable speed controls.

## Features

- **Parallax Background Toggle**: Enable parallax scrolling on any Cover block
- **Speed Control**: Choose from 5 preset speeds or set a custom value (0.1 - 1.0)
- **Editor Preview**: See the parallax effect in real-time while editing
- **Accessibility**: Respects `prefers-reduced-motion` user preference
- **Mobile Optimized**: Automatically disables on smaller screens for better performance
- **Mutual Exclusivity**: Automatically disables "Fixed background" when parallax is enabled

## Requirements

- WordPress 6.0 or higher
- PHP 7.4 or higher

## Installation

1. Upload the `cover-parallax-style` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Edit any page or post with a Cover block
4. In the block settings sidebar, toggle "Parallax background"

## Usage

1. Add or select a Cover block
2. In the Settings panel, enable "Parallax background"
3. Adjust the speed using the preset slider (1-5) or click the settings icon to enter a custom value
4. Lower values (1) create a subtle effect, higher values (5) create more dramatic movement

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

## How It Works

The plugin uses JavaScript-based parallax with CSS transforms for smooth, reliable scrolling:

- Background images are sized at 130% height with -15% top offset to allow movement room
- `requestAnimationFrame` ensures 60fps smooth animations
- The effect is calculated based on viewport position for natural depth perception
- GPU acceleration via `will-change: transform` and `backface-visibility: hidden`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This plugin is free software released under the terms of the GNU General Public License version 2 or (at your option) any later version. See [LICENSE](LICENSE) for full license text.

This is the same license used by WordPress itself, ensuring full compatibility with the WordPress ecosystem.
