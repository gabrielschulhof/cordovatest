( function( $, undefined ) {

var deviceReadyDeferred = $.Deferred();
	idUuid = 0,
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
	.on( "pagecontainerload", function( event, data ) {
		var linkData;

		// Transfer link data from the link that opens the page to the page itself
		if ( data.options && data.options.link ) {
			linkData = data.options.link.closest( "li" ).jqmData( "linkData" );
			if ( linkData && data.page ) {
				data.page.jqmData( "linkData", linkData );
			}
		}
	})
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

pagecreateHandlers[ "contacts-edit" ] = function( page ) {
	var itemIndex, addresses, preferredRadioId, id, organizations, photos,
		localISODate = function( date ) {
			var returnValue,
				month = date.getMonth() + 1,
				day = date.getDate();

			returnValue = date.getFullYear() + "-" +
				( ( month < 10 ) ? ( "0" + month ) : month ) + "-" +
				( ( day < 10 ) ? ( "0" + day ) : day );

			return returnValue;
		},
		ui = {
			addressesList: $( "#addresses" ),
			organizationsList: $( "#organizations" ),
			photosList: $( "#photos" ),
		},
		contact = page.jqmData( "linkData" ),
		addContactFieldList = function( list, listview, idPrefix, nameUuid, inputType ) {
			var itemIndex, id;

			for ( itemIndex in list ) {
				id = ( idUuid++ );
				$( "<li></li>" )
					.append( $( "<div class='ui-field-contain'></div>" )
						.append( "<label for='" + idPrefix + "type-" + id + "'>Type</label>" )
						.append( $( "<input type='text' id='" + idPrefix + "type-" + id + "'></input>" )
							.val( list[ itemIndex ].type ) )
						.children( "input" )
							.textinput()
						.end() )
					.append( $( "<div class='ui-field-contain'></div>" )
						.append( "<label for='" + idPrefix + "value-" + id + "'>Number</label>" )
						.append( $( "<input type='" + inputType + "' id='" + idPrefix + "value-" + id + "'></input>" )
							.val( list[ itemIndex ].value ) )
						.children( "input" )
							.textinput()
						.end() )
					.append( $( "<div class='ui-field-contain'></div>" )
						.append( $( "<label>Preferred</label>" )
							.append( $( "<input type='radio' name='" + idPrefix + "group-" + nameUuid + "'></input>" )
								.prop( "checked", list[ itemIndex ].pref ) ) )
						.find( "input" )
							.checkboxradio()
						.end() )
					.append( "<div class='ui-field-contain'>" +
						"<a href='#' data-delete-item='" + idPrefix + "-button' class='ui-btn ui-corner-all ui-shadow ui-icon-delete ui-btn-icon-right'>Delete</a>" +
						"</div>" )
					.insertBefore( listview.children().last() );
			}
			listview.listview( "refresh" );
		};

	if ( contact ) {

		$.extend( ui, {
			// Name
			displayName: $( "h1", page ).text( contact.displayName ),
			formatted: $( "#formatted" ).val( contact.name.formatted ),
			familyName: $( "#familyName" )
				.val( contact.name.familyName )
				.on( "change", function() {
					contact.name.familyName = ui.familyName.val();
					contact.save();
				}),
			givenName: $( "#givenName" )
				.val( contact.name.givenName )
				.on( "change", function() {
					contact.name.givenName = ui.givenName.val();
					contact.save();
				}),
			middleName: $( "#middleName" ).val( contact.name.middleName ),
			honorificPrefix: $( "#honorificPrefix" ).val( contact.name.honorificPrefix ),
			honorificSuffix: $( "#honorificSuffix" ).val( contact.name.honorificSuffix ),

			// Nickname
			nickname: $( "#nickname", page )
				.val( contact.nickname )
				.on( "change", function() {
					contact.nickname = ui.nickname.val();
					contact.save();
				}),

			// Birthday
			birthday: $( "#birthday" ).val( localISODate( contact.birthday ) ),

			// Note
			note: $( "#note" ).val( contact.note ),

			phoneNumbers: $( "#phoneNumbers" ),
			emails: $( "#emails" ),
			ims: $( "#ims" ),
			categories: $( "#categories" ),
			urls: $( "#urls" )
		});

		// Phone numbers
		addContactFieldList( contact.phoneNumbers, ui.phoneNumbers, "phoneNumbers-", ( idUuid++ ), "tel" );

		// Emails
		addContactFieldList( contact.emails, ui.emails, "emails-", ( idUuid++ ), "email" );

		// Addresses
		addresses = contact.addresses;
		preferredRadioId = ( idUuid++ );
		for ( itemIndex in addresses ) {
			id = ( idUuid++ );
			$( "<li></li>" )
				.append( $( "<div class='ui-field-contain'></div>" )
					.append( "<label for='address-type-" + id + "'>Type</label>" )
					.append( $( "<input type='text' id='address-type-" + id + "'></input>" )
						.val( addresses[ itemIndex ].type ) )
					.children( "input" )
						.textinput()
					.end() )
				.append( $( "<div class='ui-field-contain'></div>" )
					.append( "<label for='address-formatted-" + id + "'>Formatted</label>" )
					.append( $( "<input type='text' id='address-formatted-" + id + "'></input>" )
						.val( addresses[ itemIndex ].formatted ) )
					.children( "input" )
						.textinput()
					.end() )
				.append( $( "<div class='ui-field-contain'></div>" )
					.append( "<label for='address-streetAddress-" + id + "'>Street address</label>" )
					.append( $( "<input type='text' id='address-streetAddress-" + id + "'></input>" )
						.val( addresses[ itemIndex ].streetAddress ) )
					.children( "input" )
						.textinput()
					.end() )
				.append( $( "<div class='ui-field-contain'></div>" )
					.append( "<label for='address-locality-" + id + "'>Locality</label>" )
					.append( $( "<input type='text' id='address-locality-" + id + "'></input>" )
						.val( addresses[ itemIndex ].locality ) )
					.children( "input" )
						.textinput()
					.end() )
				.append( $( "<div class='ui-field-contain'></div>" )
					.append( "<label for='address-region-" + id + "'>Region</label>" )
					.append( $( "<input type='text' id='address-region-" + id + "'></input>" )
						.val( addresses[ itemIndex ].region ) )
					.children( "input" )
						.textinput()
					.end() )
				.append( $( "<div class='ui-field-contain'></div>" )
					.append( "<label for='address-postalCode-" + id + "'>Postal code</label>" )
					.append( $( "<input type='text' id='address-postalCode-" + id + "'></input>" )
						.val( addresses[ itemIndex ].postalCode ) )
					.children( "input" )
						.textinput()
					.end() )
				.append( $( "<div class='ui-field-contain'></div>" )
					.append( "<label for='address-country-" + id + "'>Country</label>" )
					.append( $( "<input type='text' id='address-country-" + id + "'></input>" )
						.val( addresses[ itemIndex ].country ) )
					.children( "input" )
						.textinput()
					.end() )
				.append( $( "<div class='ui-field-contain'></div>" )
					.append( $( "<label>Preferred</label>" )
						.append( $( "<input type='radio' name='address-group-" + preferredRadioId + "'></input>" )
							.prop( "checked", addresses[ itemIndex ].pref ) ) )
					.find( "input" )
						.checkboxradio()
					.end() )
				.append( "<div class='ui-field-contain'>" +
					"<a href='#' data-delete-item='addresses-button' class='ui-btn ui-corner-all ui-shadow ui-icon-delete ui-btn-icon-right'>Delete</a>" +
					"</div>" )
				.insertBefore( ui.addressesList.children().last() );
		}
		ui.addressesList.listview( "refresh" );

		// IMs
		addContactFieldList( contact.ims, ui.ims, "ims-", ( idUuid++ ), "text" );

		// Organizations
		preferredRadioId = ( idUuid++ );
		organizations = contact.organizations;

		for ( itemIndex in organizations ) {
			$( "<li></li>" )
				.append( $( "<div class='ui-field-contain'></div>" )
					.append( "<label for='organization-type-" + id + "'>Type</label>" )
					.append( $( "<input type='text' id='organization-type-" + id + "'></input>" )
						.val( organizations[ itemIndex ].type ) )
					.children( "input" )
						.textinput()
					.end() )
				.append( $( "<div class='ui-field-contain'></div>" )
					.append( "<label for='organization-name-" + id + "'>Name</label>" )
					.append( $( "<input type='text' id='organization-name-" + id + "'></input>" )
						.val( organizations[ itemIndex ].name ) )
					.children( "input" )
						.textinput()
					.end() )
				.append( $( "<div class='ui-field-contain'></div>" )
					.append( "<label for='organization-department-" + id + "'>Department</label>" )
					.append( $( "<input type='text' id='organization-department-" + id + "'></input>" )
						.val( organizations[ itemIndex ].department ) )
					.children( "input" )
						.textinput()
					.end() )
				.append( $( "<div class='ui-field-contain'></div>" )
					.append( "<label for='organization-title-" + id + "'>Title</label>" )
					.append( $( "<input type='text' id='organization-title-" + id + "'></input>" )
						.val( organizations[ itemIndex ].title ) )
					.children( "input" )
						.textinput()
					.end() )
				.append( "<div class='ui-field-contain'>" +
					"<a href='#' data-delete-item='organizations-button' class='ui-btn ui-corner-all ui-shadow ui-icon-delete ui-btn-icon-right'>Delete</a>" +
					"</div>" )
				.insertBefore( ui.organizationsList.children().last() );
		}
		ui.organizationsList.listview( "refresh" );

		// Photos
		photos = contact.photos;
		preferredRadioId = ( idUuid++ );
		for ( itemIndex in photos ) {
			$( "<li><a href='#'><img src='" + photos[ itemIndex ].value + "' /><p>" + photos[ itemIndex ].value + "</p></a></li>" )
				.insertBefore( ui.photosList.children().last() );
		}
		ui.photosList.listview( "refresh" );

		// Categories
		addContactFieldList( contact.categories, ui.categories, "categories-", ( idUuid++ ), "text" );

		// URLs
		addContactFieldList( contact.urls, ui.urls, "urls-", ( idUuid++ ), "url" );
	}
};

pagecreateHandlers[ "camera-page" ] = function( page ) {
	deviceReadyDeferred.done( function() {
		$( "input[name='picture-source']" ).on( "click", function() {
			navigator.camera.getPicture( function( result ) {
				$( "#the-picture" )
					.toggleClass( "ui-screen-hidden", !result )
					.attr( "src", result );
			}, function( error ) {
				alert( "An error occurred: " + error );
			}, {
				sourceType: navigator.camera.PictureSourceType[
					$( "#from-library" ).is( ":checked" ) ? "PHOTOLIBRARY" : "CAMERA" ],
				destinationType: navigator.camera.DestinationType.FILE_URL
			});
		});
	});
};

pagecreateHandlers[ "contacts-page" ] = function( page ) {
	var contactList = $( "#contact-list" )
		.on( "click", "li a:last-child", function( event ) {
			var contact = $( event.target ).closest( "li" ).jqmData( "linkData" );

			if ( contact ) {
				contact.remove();
			}
		});
	deviceReadyDeferred.done( function() {
		$( "<a href='#' class='ui-btn ui-corner-all ui-btn-right ui-btn-inline ui-icon-plus ui-btn-icon-notext'>Add Contact</a>" )
			.appendTo( "#contacts-page-header" )
			.on( "click", function() {
				// Add contact
			});
		navigator.contacts.find( [ "*" ],
			function( contacts ) {
				var idx;

				for ( idx in contacts ) {
					contactList.append( $( "<li>" +
						"<a href='contacts-edit.html'>" + contacts[ idx ].displayName + "</a>" +
						"<a href='#' class='ui-icon-delete'></a>" +
					"</li>" )
						.jqmData( "linkData", contacts[ idx ] ) );
				}
				contactList.listview( "refresh" );
			}),
			function( error ) {
				contactList.before( "<p class='warning'>Failed to retrieve contacts: " + error + "</p>" );
			}
	});
};

})( jQuery );
