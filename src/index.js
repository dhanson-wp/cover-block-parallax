/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from '@wordpress/element';

/**
 * Styles
 */
import './style.scss';

/**
 * Editor Parallax Effect
 *
 * Initialize parallax scrolling in the block editor.
 * Handles the iframe-based editor used in WordPress 5.9+.
 */
( function initEditorParallax() {
	const PARALLAX_SPEED = 0.5;
	const MAX_OFFSET_PERCENT = 0.15;
	let parallaxItems = [];
	let ticking = false;
	let iframeWindow = null;
	let iframeDoc = null;
	let observer = null;

	function findBackground( container ) {
		return (
			container.querySelector( '.wp-block-cover__image-background' ) ||
			container.querySelector( '.wp-block-cover__video-background' ) ||
			container.querySelector( '.wp-block-cover__background' ) ||
			container.querySelector( 'img' ) ||
			container.querySelector( 'video' )
		);
	}

	function updateParallax() {
		if ( ! iframeWindow ) {
			ticking = false;
			return;
		}

		const viewportHeight = iframeWindow.innerHeight;

		parallaxItems.forEach( ( item ) => {
			const rect = item.container.getBoundingClientRect();

			if ( rect.bottom < 0 || rect.top > viewportHeight ) {
				return;
			}

			const scrollProgress =
				( viewportHeight - rect.top ) / ( viewportHeight + rect.height );
			const progress = Math.max( 0, Math.min( 1, scrollProgress ) );
			const maxOffset = rect.height * MAX_OFFSET_PERCENT;
			const offset = ( progress - 0.5 ) * maxOffset * PARALLAX_SPEED * 2;

			item.background.style.transform = `translateY(${ offset }px)`;
		} );

		ticking = false;
	}

	function onScroll() {
		if ( ! ticking ) {
			requestAnimationFrame( updateParallax );
			ticking = true;
		}
	}

	function collectParallaxItems() {
		if ( ! iframeDoc ) {
			return;
		}

		const containers = iframeDoc.querySelectorAll(
			'.wp-block-cover.has-parallax-scroll'
		);

		parallaxItems = [];

		containers.forEach( ( container ) => {
			const background = findBackground( container );
			if ( background ) {
				parallaxItems.push( { container, background } );
			}
		} );

		if ( parallaxItems.length > 0 ) {
			updateParallax();
		}
	}

	function setupIframe( iframe ) {
		try {
			iframeWindow = iframe.contentWindow;
			iframeDoc = iframe.contentDocument || iframeWindow?.document;

			if ( ! iframeDoc || ! iframeDoc.body ) {
				return false;
			}

			// Listen for scroll on the iframe's window
			iframeWindow.addEventListener( 'scroll', onScroll, { passive: true } );

			// Watch for DOM changes
			if ( observer ) {
				observer.disconnect();
			}

			observer = new MutationObserver( () => {
				collectParallaxItems();
			} );

			observer.observe( iframeDoc.body, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: [ 'class' ],
			} );

			collectParallaxItems();
			return true;
		} catch ( e ) {
			// eslint-disable-next-line no-console
			console.warn( 'Parallax: Could not access iframe', e );
			return false;
		}
	}

	function waitForIframe() {
		const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );

		if ( ! iframe ) {
			setTimeout( waitForIframe, 500 );
			return;
		}

		// Check if iframe is ready
		const trySetup = () => {
			if ( setupIframe( iframe ) ) {
				return;
			}
			// Retry if not ready
			setTimeout( trySetup, 200 );
		};

		if ( iframe.contentDocument?.readyState === 'complete' ) {
			trySetup();
		} else {
			iframe.addEventListener( 'load', trySetup );
		}
	}

	// Start looking for the editor iframe
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', waitForIframe );
	} else {
		waitForIframe();
	}
} )();

/**
 * Add hasParallaxScroll attribute to the Cover block.
 *
 * @param {Object} settings Original block settings.
 * @param {string} name     Block name.
 * @return {Object} Modified block settings.
 */
function addParallaxAttribute( settings, name ) {
	if ( name !== 'core/cover' ) {
		return settings;
	}

	return {
		...settings,
		attributes: {
			...settings.attributes,
			hasParallaxScroll: {
				type: 'boolean',
				default: false,
			},
		},
	};
}

addFilter(
	'blocks.registerBlockType',
	'cover-parallax-style/add-attribute',
	addParallaxAttribute
);

/**
 * Add Parallax background toggle to the Cover block's Settings panel.
 */
const withParallaxControl = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if ( props.name !== 'core/cover' ) {
			return <BlockEdit { ...props } />;
		}

		const { attributes, setAttributes } = props;
		const { hasParallaxScroll, hasParallax } = attributes;

		// Track previous hasParallax value to detect when it's enabled
		const prevHasParallax = useRef( hasParallax );

		// When fixed background is enabled, disable parallax background
		useEffect( () => {
			if ( hasParallax && ! prevHasParallax.current && hasParallaxScroll ) {
				setAttributes( { hasParallaxScroll: false } );
			}
			prevHasParallax.current = hasParallax;
		}, [ hasParallax, hasParallaxScroll, setAttributes ] );

		return (
			<>
				<BlockEdit { ...props } />
				<InspectorControls group="settings">
					<PanelBody>
						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Parallax background', 'cover-parallax-style' ) }
							checked={ !! hasParallaxScroll }
							onChange={ ( value ) => {
								// When enabling parallax background, disable fixed background
								if ( value && hasParallax ) {
									setAttributes( {
										hasParallaxScroll: value,
										hasParallax: false,
									} );
								} else {
									setAttributes( { hasParallaxScroll: value } );
								}
							} }
							help={ __( 'Background scrolls at a different speed than content.', 'cover-parallax-style' ) }
						/>
					</PanelBody>
				</InspectorControls>
			</>
		);
	};
}, 'withParallaxControl' );

addFilter(
	'editor.BlockEdit',
	'cover-parallax-style/with-parallax-control',
	withParallaxControl
);

/**
 * Add has-parallax-scroll class to the Cover block when saved (frontend).
 *
 * @param {Object} props      Additional props applied to save element.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Block attributes.
 * @return {Object} Filtered props.
 */
function addParallaxClassToSave( props, blockType, attributes ) {
	if ( blockType.name !== 'core/cover' ) {
		return props;
	}

	if ( attributes.hasParallaxScroll ) {
		return {
			...props,
			className: props.className
				? `${ props.className } has-parallax-scroll`
				: 'has-parallax-scroll',
		};
	}

	return props;
}

addFilter(
	'blocks.getSaveContent.extraProps',
	'cover-parallax-style/add-parallax-class-save',
	addParallaxClassToSave
);

/**
 * Add has-parallax-scroll class to the Cover block in the editor.
 * This is needed because blocks.getSaveContent.extraProps only affects saved output.
 */
const withParallaxClassInEditor = createHigherOrderComponent( ( BlockListBlock ) => {
	return ( props ) => {
		if ( props.name !== 'core/cover' ) {
			return <BlockListBlock { ...props } />;
		}

		const { attributes } = props;

		if ( attributes.hasParallaxScroll ) {
			const className = props.className
				? `${ props.className } has-parallax-scroll`
				: 'has-parallax-scroll';

			return <BlockListBlock { ...props } className={ className } />;
		}

		return <BlockListBlock { ...props } />;
	};
}, 'withParallaxClassInEditor' );

addFilter(
	'editor.BlockListBlock',
	'cover-parallax-style/add-parallax-class-editor',
	withParallaxClassInEditor
);
