<?php
/**
 * Plugin Name: Cover Block Parallax Style
 * Plugin URI: https://github.com/derekhanson/cover-block-parallax
 * Description: Adds a smooth parallax scrolling effect to the WordPress Cover block with adjustable speed controls.
 * Version: 1.1.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Derek Hanson
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: cover-parallax-style
 *
 * @package CoverParallaxStyle
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue block editor assets.
 *
 * Loads the JavaScript that registers the parallax-scroll block style
 * for the Cover block in the editor.
 *
 * @return void
 */
function cover_parallax_style_enqueue_block_editor_assets() {
	$asset_file = plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = include $asset_file;

	wp_enqueue_script(
		'cover-parallax-style-editor',
		plugins_url( 'build/index.js', __FILE__ ),
		$asset['dependencies'],
		$asset['version'],
		true
	);

	wp_set_script_translations(
		'cover-parallax-style-editor',
		'cover-parallax-style'
	);
}
add_action( 'enqueue_block_editor_assets', 'cover_parallax_style_enqueue_block_editor_assets' );

/**
 * Enqueue frontend and editor styles.
 *
 * Loads the CSS that applies the parallax effect when the
 * is-style-parallax-scroll class is present on a Cover block.
 *
 * @return void
 */
function cover_parallax_style_enqueue_block_assets() {
	$style_file = plugin_dir_path( __FILE__ ) . 'build/style-index.css';

	if ( ! file_exists( $style_file ) ) {
		return;
	}

	wp_enqueue_style(
		'cover-parallax-style',
		plugins_url( 'build/style-index.css', __FILE__ ),
		array(),
		filemtime( $style_file )
	);
}
add_action( 'enqueue_block_assets', 'cover_parallax_style_enqueue_block_assets' );

/**
 * Enqueue frontend script for parallax scrolling.
 *
 * Loads the JavaScript that handles the parallax scroll effect
 * on the frontend using requestAnimationFrame for smooth performance.
 *
 * @return void
 */
function cover_parallax_style_enqueue_frontend_script() {
	// Only load on frontend, not in editor.
	if ( is_admin() ) {
		return;
	}

	$script_file = plugin_dir_path( __FILE__ ) . 'build/frontend.js';

	if ( ! file_exists( $script_file ) ) {
		return;
	}

	wp_enqueue_script(
		'cover-parallax-style-frontend',
		plugins_url( 'build/frontend.js', __FILE__ ),
		array(),
		filemtime( $script_file ),
		false // Load in head for early execution
	);
}
add_action( 'wp_enqueue_scripts', 'cover_parallax_style_enqueue_frontend_script' );
