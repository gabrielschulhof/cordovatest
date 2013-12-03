( function( $, undefined ) {

var deviceReadyDeferred = $.Deferred();
	pagecreateHandlers = {},
	openPanelLinkId = 1,
	navList = null,
	// Create nav list based on detected cordova features and store it in navList
	createNavList = function() {
		if ( navList === null ) {
			navList = "";
			if ( "device" in window ) {
				navList += "<li><a href='device.html'>Device</li></a>";
			}
			if ( "splashscreen" in navigator ) {
				navList += "<li><a href='splash.html'>Splashscreen</li></a>";
			}
			if ( "camera" in navigator ) {
				navList += "<li><a href='camera.html'>Camera</li></a>";
			}
			if ( "contacts" in navigator ) {
				navList += "<li><a href='contacts.html'>Contacts</li></a>";
			}
			if ( "geolocation" in navigator ) {
				navList += "<li><a href='geolocation.html'>Geolocation</li></a>";
			}
		}
		return navList;
	};

$.mobile.document
	.one( "click", "#exit-app", function() {
		tizen.application.getCurrentApplication().exit();
	})
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
			// Remove cordova launcher button from the page and replace it with an exit button
			$( ".cordova-launcher", page ).remove();

			// Fill in the navigation panel and remove class so we never find it again
			// the navigation list will replace the waiting message
			$( ".nav-list", page )
				.removeClass( "nav-list" )
					.children( ".waiting" )
						.remove()
					.end()
					.children()
						.first()
							.after( createNavList() )
						.end()
					.end()
				.listview( "refresh" );
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
