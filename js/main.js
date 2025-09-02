/**
 * Sets up Justified Gallery.
 */
if (!!$.prototype.justifiedGallery) {
  var options = {
    rowHeight: 140,
    margins: 4,
    lastRow: "justify"
  };
  $(".article-gallery").justifiedGallery(options);
}

$(document).ready(function() {

  /**
   * Shows the responsive navigation menu on mobile.
   */
  $("#header > #nav > ul > .icon").click(function() {
    $("#header > #nav > ul").toggleClass("responsive");
  });

  /**
   * Prevent navigation from disappearing when clicking TOC links
   */
  var navigationForceVisible = false;
  var navigationForceTimer = null;
  
  function forceNavigationVisible(duration) {
    navigationForceVisible = true;
    if ($(window).width() > 500) {
      $("#header-post").show();
      $("#menu").show();
      $("#nav").show();
    }
    
    // Clear existing timer and set new one
    if (navigationForceTimer) {
      clearTimeout(navigationForceTimer);
    }
    navigationForceTimer = setTimeout(function() {
      navigationForceVisible = false;
      navigationForceTimer = null;
    }, duration || 1000);
  }
  
  $(document).on('click', '#toc a[href^="#"], #toc-footer a[href^="#"]', function() {
    forceNavigationVisible(1000);
  });

  // Monitor hash changes (for direct URL access with anchors)
  $(window).on('hashchange', function() {
    forceNavigationVisible(1000);
  });

  // Check on page load if there's a hash in URL
  $(document).ready(function() {
    if (window.location.hash) {
      forceNavigationVisible(1000);
    }
  });

  // Monitor keyboard navigation that might affect scroll position
  var keyboardNavigationTimer = null;
  $(document).on('keydown', function(e) {
    var navigationKeys = ['Home', 'End', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    
    if (navigationKeys.includes(e.key) && $(window).width() > 500) {
      // For repeated keyboard navigation, extend the protection time
      forceNavigationVisible(2000);
      
      // Also add immediate protection that resets on each keypress
      if (keyboardNavigationTimer) {
        clearTimeout(keyboardNavigationTimer);
      }
      keyboardNavigationTimer = setTimeout(function() {
        keyboardNavigationTimer = null;
      }, 500);
    }
  });

  // Monitor back-to-top clicks (both desktop and mobile versions)
  $(document).on('click', 'a[href="#"], a[onclick*="scrollTop"]', function() {
    forceNavigationVisible(1000);
  });


  /**
   * Controls the different versions of  the menu in blog post articles 
   * for Desktop, tablet and mobile.
   */
  if ($(".post").length) {
    var menu = $("#menu");
    var nav = $("#menu > #nav");
    var menuIcon = $("#menu-icon, #menu-icon-tablet");

    /**
     * Display the menu on hi-res laptops and desktops.
     */
    if ($(document).width() >= 1440) {
      menu.show();
      menuIcon.addClass("active");
    }

    /**
     * Display the menu if the menu icon is clicked.
     */
    menuIcon.click(function() {
      if (menu.is(":hidden")) {
        menu.show();
        menuIcon.addClass("active");
      } else {
        menu.hide();
        menuIcon.removeClass("active");
      }
      return false;
    });

    /**
     * Add a scroll listener to the menu to hide/show the navigation links.
     */
    if (menu.length) {
      $(window).on("scroll", function() {
        // Don't hide navigation if it's been forced visible due to anchor navigation or keyboard navigation
        if (navigationForceVisible || keyboardNavigationTimer) {
          return;
        }
        
        var topDistance = menu.offset().top;

        // hide only the navigation links on desktop
        if (!nav.is(":visible") && topDistance < 50) {
          nav.show();
        } else if (nav.is(":visible") && topDistance > 100) {
          nav.hide();
        }

        // on tablet, hide the navigation icon as well and show a "scroll to top
        // icon" instead
        if ( ! $( "#menu-icon" ).is(":visible") && topDistance < 50 ) {
          $("#menu-icon-tablet").show();
          $("#top-icon-tablet").hide();
        } else if (! $( "#menu-icon" ).is(":visible") && topDistance > 100) {
          $("#menu-icon-tablet").hide();
          $("#top-icon-tablet").show();
        }
      });
    }

    /**
     * Show mobile navigation menu after scrolling upwards,
     * hide it again after scrolling downwards.
     */
    if ($( "#footer-post").length) {
      var lastScrollTop = 0;
      $(window).on("scroll", function() {
        // Don't hide navigation if it's been forced visible due to anchor navigation or keyboard navigation
        if (navigationForceVisible || keyboardNavigationTimer) {
          return;
        }
        
        var topDistance = $(window).scrollTop();

        if (topDistance > lastScrollTop){
          // downscroll -> show menu
          $("#footer-post").hide();
        } else {
          // upscroll -> hide menu
          $("#footer-post").show();
        }
        lastScrollTop = topDistance;

        // close all submenu"s on scroll
        $("#nav-footer").hide();
        $("#toc-footer").hide();
        $("#share-footer").hide();

        // show a "navigation" icon when close to the top of the page, 
        // otherwise show a "scroll to the top" icon
        if (topDistance < 50) {
          $("#actions-footer > #top").hide();
        } else if (topDistance > 100) {
          $("#actions-footer > #top").show();
        }
      });
    }
  }
});
