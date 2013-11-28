( function( $, undefined ) {

var deviceReadyDeferred = $.Deferred();
	pagecreateHandlers = {},
	openPanelLinkId = 1,
	navList = null,
	// Create nav list based on detected cordova features and store it in navList
	createNavList = function() {
		if ( !navList ) {
			navList = $( "<ul>" );
			navList.append( "<li><a href='index.html' data-icon='home'>Home</li></a>" );
			if ( "device" in window ) {
				navList.append( "<li><a href='device.html'>Device</li></a>" );
			}
			if ( "splashscreen" in navigator ) {
				navList.append( "<li><a href='splash.html'>Splashscreen</li></a>" );
			}
			if ( "camera" in navigator ) {
				navList.append( "<li><a href='camera.html'>Camera</li></a>" );
			}
			if ( "contacts" in navigator ) {
				navList.append( "<li><a href='contacts.html'>Contacts</li></a>" );
			}
			if ( "geolocation" in navigator ) {
				navList.append( "<li><a href='geolocation.html'>Geolocation</li></a>" );
			}
		}
		return navList;
	},
	addNavList = function( parent ) {
		createNavList().clone().appendTo( parent ).listview();
	};

$.mobile.document
	.one( "deviceready", function() {
		deviceReadyDeferred.resolve();
	})
	.one( "click", ".cordova-launcher", function() {
		launchCordova();
	})
	.on( "pagecreate", function( event ) {
		var
			page = $( event.target ),
			pageId = page.attr( "id" );

		if ( pageId in pagecreateHandlers ) {
			pagecreateHandlers[ pageId ]( page );
		}

		deviceReadyDeferred.done( function() {
			// Fill in the navigation panel and remove class so we never find it agains
			var panel = $( ".nav-panel", page ).removeClass( "nav-panel" );

			// Remove cordova launcher buttton from the page
			$( ".cordova-launcher", page ).remove();

			// the navigation list will replace the waiting message
			addNavList( panel.find( ".waiting" ).parent().empty() );
		});
	});

pagecreateHandlers[ "device-page" ] = function( page ) {
	deviceReadyDeferred.done( function() {
		$( "table", page )
			.children( "tbody" )
			.append( "<tr>" +
				"<td>" + device.model + "</td>" +
				"<td>" + device.cordova + "</td>" +
				"<td>" + device.platform + "</td>" +
				"<td>" + device.uuid + "</td>" +
				"<td>" + device.version + "</td>" +
			"</tr>" )
			.end()
			.table( "refresh" );
	});
};

pagecreateHandlers[ "splash-page" ] = function( page ) {
	deviceReadyDeferred.done( function() {
		$( "#show-splash-screen" )
			.removeClass( "ui-state-disabled" )
			.on( "click", $.proxy ( navigator.splashscreen, "show" ) );
	});
};

})( jQuery );
