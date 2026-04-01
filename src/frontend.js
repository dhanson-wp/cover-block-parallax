/**
 * Frontend parallax scroll effect for Cover blocks.
 *
 * Uses requestAnimationFrame for smooth, performant parallax scrolling.
 * The background moves at a slower rate than the page scroll, creating depth.
 */

( function () {
	'use strict';

	// Default speed if not specified
	const DEFAULT_SPEED = 0.5;
	const MAX_OFFSET_PERCENT = 0.15; // 15% of container height (half of 30% extra)
	const MOBILE_BREAKPOINT = '(max-width: 768px)';

	// Check for reduced motion preference
	const prefersReducedMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;

	// Skip parallax entirely if reduced motion is preferred
	if ( prefersReducedMotion ) {
		return;
	}

	// Track animation frame request
	let ticking = false;

	// Store parallax elements and their backgrounds
	let parallaxItems = [];

	// Track whether scroll listener is currently attached
	let scrollListenerActive = false;

	/**
	 * Initialize parallax elements.
	 */
	function initParallax() {
		const containers = document.querySelectorAll(
			'.wp-block-cover.has-parallax-scroll'
		);

		parallaxItems = [];

		containers.forEach( ( container ) => {
			// Find the background element (image, video, or color overlay)
			const background =
				container.querySelector( '.wp-block-cover__image-background' ) ||
				container.querySelector( '.wp-block-cover__video-background' ) ||
				container.querySelector( '.wp-block-cover__background' ) ||
				container.querySelector( ':scope > img' ) ||
				container.querySelector( ':scope > video' );

			if ( background ) {
				// Read speed from data attribute, default to 0.5
				const speed = parseFloat(
					container.dataset.parallaxSpeed || DEFAULT_SPEED
				);

				parallaxItems.push( {
					container,
					background,
					speed,
				} );
			}
		} );

		// Initial update
		if ( parallaxItems.length > 0 ) {
			updateParallax();
		}
	}

	/**
	 * Update parallax positions based on scroll.
	 */
	function updateParallax() {
		const windowHeight = window.innerHeight;

		parallaxItems.forEach( ( item ) => {
			const rect = item.container.getBoundingClientRect();

			// Only process if element is in or near viewport
			if ( rect.bottom < -100 || rect.top > windowHeight + 100 ) {
				return;
			}

			// Calculate how far through the viewport the element is
			// 0 = element just entering bottom, 1 = element just leaving top
			const scrollProgress =
				( windowHeight - rect.top ) / ( windowHeight + rect.height );

			// Clamp between 0 and 1
			const progress = Math.max( 0, Math.min( 1, scrollProgress ) );

			// Calculate parallax offset using the item's speed
			// At progress 0 (bottom of viewport): background at top of its range
			// At progress 1 (top of viewport): background at bottom of its range
			const maxOffset = rect.height * MAX_OFFSET_PERCENT;
			const offset = ( progress - 0.5 ) * maxOffset * item.speed * 2;

			// Apply transform
			item.background.style.transform = `translateY(${ offset }px)`;
		} );

		ticking = false;
	}

	/**
	 * Handle scroll event with requestAnimationFrame throttling.
	 */
	function onScroll() {
		if ( ! ticking ) {
			requestAnimationFrame( updateParallax );
			ticking = true;
		}
	}

	/**
	 * Add scroll listener if not already active.
	 */
	function addScrollListener() {
		if ( ! scrollListenerActive ) {
			window.addEventListener( 'scroll', onScroll, { passive: true } );
			scrollListenerActive = true;
		}
	}

	/**
	 * Remove scroll listener if active.
	 */
	function removeScrollListener() {
		if ( scrollListenerActive ) {
			window.removeEventListener( 'scroll', onScroll );
			scrollListenerActive = false;
		}
	}

	/**
	 * Enable parallax: initialize elements and attach scroll listener.
	 */
	function enableParallax() {
		initParallax();
		addScrollListener();
	}

	/**
	 * Disable parallax: reset transforms and remove scroll listener.
	 */
	function disableParallax() {
		parallaxItems.forEach( ( item ) => {
			item.background.style.transform = '';
		} );
		parallaxItems = [];
		removeScrollListener();
	}

	/**
	 * Handle viewport size changes.
	 * Enables or disables parallax based on the current breakpoint.
	 */
	function onResize() {
		const isMobile = window.matchMedia( MOBILE_BREAKPOINT ).matches;

		if ( isMobile ) {
			disableParallax();
		} else {
			enableParallax();
		}
	}

	/**
	 * Bootstrap: set up resize listener and conditionally enable parallax.
	 */
	function bootstrap() {
		window.addEventListener( 'resize', onResize, { passive: true } );

		// Only activate parallax if viewport is wide enough at load time
		if ( ! window.matchMedia( MOBILE_BREAKPOINT ).matches ) {
			enableParallax();
		}
	}

	// Initialize when DOM is ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', bootstrap );
	} else {
		bootstrap();
	}
} )();
