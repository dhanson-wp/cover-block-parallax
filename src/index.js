/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	RangeControl,
	Button,
	Flex,
	FlexItem,
	FlexBlock,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import { settings as settingsIcon } from '@wordpress/icons';

/**
 * Styles
 */
import './style.scss';

/**
 * Speed presets configuration - 5 evenly spaced presets
 * Using simple 1-5 scale internally, mapped to actual speed values
 */
const PRESET_VALUES = [ 0.3, 0.475, 0.65, 0.825, 1.0 ]; // Evenly spaced from 0.3 to 1.0
const DEFAULT_SPEED = 0.3; // Start at slowest (preset 1)
const MIN_SPEED = 0.1;
const MAX_SPEED = 1.0;
const SPEED_STEP = 0.05;

/**
 * Convert preset index (1-5) to actual speed value
 */
function presetToSpeed( presetIndex ) {
	// Convert 1-5 to array index 0-4
	const arrayIndex = presetIndex - 1;
	return PRESET_VALUES[ arrayIndex ] || DEFAULT_SPEED;
}

/**
 * Convert actual speed value to nearest preset index (1-5)
 */
function speedToPreset( speed ) {
	let closestIndex = 0;
	let closestDiff = Math.abs( PRESET_VALUES[ 0 ] - speed );

	PRESET_VALUES.forEach( ( value, index ) => {
		const diff = Math.abs( value - speed );
		if ( diff < closestDiff ) {
			closestDiff = diff;
			closestIndex = index;
		}
	} );

	// Convert array index 0-4 to display index 1-5
	return closestIndex + 1;
}

/**
 * Check if a value matches one of the presets (within tolerance)
 */
function isPresetValue( value ) {
	return PRESET_VALUES.some(
		( preset ) => Math.abs( preset - value ) < 0.01
	);
}

/**
 * Editor Parallax Effect
 *
 * Initialize parallax scrolling in the block editor.
 * Handles the iframe-based editor used in WordPress 5.9+.
 */
( function initEditorParallax() {
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
			const offset = ( progress - 0.5 ) * maxOffset * item.speed * 2;

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
				// Read speed from data attribute, default to 0.5
				const speed = parseFloat(
					container.dataset.parallaxSpeed || DEFAULT_SPEED
				);
				parallaxItems.push( { container, background, speed } );
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
				attributeFilter: [ 'class', 'data-parallax-speed' ],
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
 * Add parallax attributes to the Cover block.
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
			parallaxSpeed: {
				type: 'number',
				default: DEFAULT_SPEED,
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
 * Add Parallax background toggle and speed control to the Cover block's Settings panel.
 */
const withParallaxControl = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if ( props.name !== 'core/cover' ) {
			return <BlockEdit { ...props } />;
		}

		const { attributes, setAttributes } = props;
		const { hasParallaxScroll, hasParallax, parallaxSpeed = DEFAULT_SPEED } = attributes;

		// Track previous hasParallax value to detect when it's enabled
		const prevHasParallax = useRef( hasParallax );

		// Track whether we're in custom mode (showing the input field)
		const [ showCustomInput, setShowCustomInput ] = useState(
			() => ! isPresetValue( parallaxSpeed )
		);

		// When fixed background is enabled, disable parallax background
		useEffect( () => {
			if ( hasParallax && ! prevHasParallax.current && hasParallaxScroll ) {
				setAttributes( { hasParallaxScroll: false } );
			}
			prevHasParallax.current = hasParallax;
		}, [ hasParallax, hasParallaxScroll, setAttributes ] );

		// Update custom mode when speed changes externally
		useEffect( () => {
			if ( ! showCustomInput && ! isPresetValue( parallaxSpeed ) ) {
				setShowCustomInput( true );
			}
		}, [ parallaxSpeed, showCustomInput ] );

		// Handle preset slider change (using 0-4 index)
		const handlePresetChange = ( presetIndex ) => {
			const speed = presetToSpeed( presetIndex );
			setAttributes( { parallaxSpeed: speed } );
		};

		// Handle custom input change
		const handleCustomChange = ( value ) => {
			setAttributes( { parallaxSpeed: value } );
		};

		// Toggle between preset and custom mode
		const toggleCustomMode = () => {
			if ( showCustomInput ) {
				// Switching to preset mode - snap to nearest preset
				const presetIndex = speedToPreset( parallaxSpeed );
				setAttributes( { parallaxSpeed: presetToSpeed( presetIndex ) } );
			}
			setShowCustomInput( ! showCustomInput );
		};

		// Get current preset index for the slider
		const currentPresetIndex = speedToPreset( parallaxSpeed );

		// Marks for preset slider (evenly spaced 1-5)
		const presetMarks = [
			{ value: 1, label: '' },
			{ value: 2, label: '' },
			{ value: 3, label: '' },
			{ value: 4, label: '' },
			{ value: 5, label: '' },
		];

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

						{ hasParallaxScroll && (
							<div className="parallax-speed-control">
								<HStack>
									<FlexBlock>
										<span className="parallax-speed-control__label">
											{ __( 'Speed', 'cover-parallax-style' ) }
										</span>
									</FlexBlock>
									<FlexItem>
										<Button
											icon={ settingsIcon }
											size="small"
											variant={ showCustomInput ? 'primary' : 'tertiary' }
											onClick={ toggleCustomMode }
											label={ showCustomInput
												? __( 'Use size preset', 'cover-parallax-style' )
												: __( 'Set custom value', 'cover-parallax-style' )
											}
											isPressed={ showCustomInput }
										/>
									</FlexItem>
								</HStack>

								{ showCustomInput ? (
									<RangeControl
										__nextHasNoMarginBottom
										value={ parallaxSpeed }
										onChange={ handleCustomChange }
										min={ MIN_SPEED }
										max={ MAX_SPEED }
										step={ SPEED_STEP }
										withInputField={ true }
									/>
								) : (
									<RangeControl
										__nextHasNoMarginBottom
										value={ currentPresetIndex }
										onChange={ handlePresetChange }
										min={ 1 }
										max={ 5 }
										marks={ presetMarks }
										step={ 1 }
										withInputField={ false }
									/>
								) }
							</div>
						) }
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
 * Add has-parallax-scroll class and data-parallax-speed to the Cover block when saved (frontend).
 *
 * @param {Object} props      Additional props applied to save element.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Block attributes.
 * @return {Object} Filtered props.
 */
function addParallaxPropsToSave( props, blockType, attributes ) {
	if ( blockType.name !== 'core/cover' ) {
		return props;
	}

	if ( attributes.hasParallaxScroll ) {
		const speed = attributes.parallaxSpeed || DEFAULT_SPEED;

		return {
			...props,
			className: props.className
				? `${ props.className } has-parallax-scroll`
				: 'has-parallax-scroll',
			'data-parallax-speed': speed,
		};
	}

	return props;
}

addFilter(
	'blocks.getSaveContent.extraProps',
	'cover-parallax-style/add-parallax-props-save',
	addParallaxPropsToSave
);

/**
 * Add has-parallax-scroll class and data-parallax-speed to the Cover block in the editor.
 * This is needed because blocks.getSaveContent.extraProps only affects saved output.
 */
const withParallaxPropsInEditor = createHigherOrderComponent( ( BlockListBlock ) => {
	return ( props ) => {
		if ( props.name !== 'core/cover' ) {
			return <BlockListBlock { ...props } />;
		}

		const { attributes } = props;

		if ( attributes.hasParallaxScroll ) {
			const speed = attributes.parallaxSpeed || DEFAULT_SPEED;
			const className = props.className
				? `${ props.className } has-parallax-scroll`
				: 'has-parallax-scroll';

			return (
				<BlockListBlock
					{ ...props }
					className={ className }
					wrapperProps={ {
						...props.wrapperProps,
						'data-parallax-speed': speed,
					} }
				/>
			);
		}

		return <BlockListBlock { ...props } />;
	};
}, 'withParallaxPropsInEditor' );

addFilter(
	'editor.BlockListBlock',
	'cover-parallax-style/add-parallax-props-editor',
	withParallaxPropsInEditor
);
