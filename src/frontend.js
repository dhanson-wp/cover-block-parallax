/**
 * Frontend parallax scroll effect for Cover blocks.
 *
 * Uses requestAnimationFrame for smooth, performant parallax scrolling.
 * The background moves at a slower rate than the page scroll, creating depth.
 */

( function () {
	'use strict';

	// Default speed if not specified (must match editor DEFAULT_SPEED in index.js)
	const DEFAULT_SPEED = 0.3;
	const MAX_OFFSET_PERCENT = 0.20; // 20% of container height (half of 40% extra)

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

	/**
	 * Check if viewport is mobile-sized.
	 */
	function isMobile() {
		return window.matchMedia( '(max-width: 768px)' ).matches;
	}

	/**
	 * Initialize parallax elements.
	 * Filters out blocks with "disable on mobile" when on a mobile viewport.
	 */
	function initParallax() {
		const containers = document.querySelectorAll(
			'.wp-block-cover.has-parallax-scroll'
		);

		const mobile = isMobile();
		parallaxItems = [];

		containers.forEach( ( container ) => {
			// Skip this block on mobile if "disable on mobile" is enabled
			if ( mobile && container.dataset.parallaxHideMobile === 'true' ) {
				return;
			}

			// Find the background element (image, video, or color overlay)
			const background =
				container.querySelector( '.wp-block-cover__image-background' ) ||
				container.querySelector( '.wp-block-cover__video-background' ) ||
				container.querySelector( '.wp-block-cover__background' ) ||
				container.querySelector( ':scope > img' ) ||
				container.querySelector( ':scope > video' );

			if ( background ) {
				// Read speed from data attribute
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
	 * Handle resize - reinitialize to recalculate dimensions and
	 * re-evaluate per-block mobile settings.
	 */
	function onResize() {
		// Reset existing transforms
		parallaxItems.forEach( ( item ) => {
			item.background.style.transform = '';
		} );

		// Reinitialize - initParallax filters per-block mobile settings
		initParallax();
	}

	// Initialize when DOM is ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', () => {
			initParallax();
			window.addEventListener( 'scroll', onScroll, { passive: true } );
			window.addEventListener( 'resize', onResize, { passive: true } );
		} );
	} else {
		initParallax();
		window.addEventListener( 'scroll', onScroll, { passive: true } );
		window.addEventListener( 'resize', onResize, { passive: true } );
	}
} )();
