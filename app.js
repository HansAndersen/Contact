function checkLogin() {
	serverIsLoggedIn(function(loggedIn) {
		if (loggedIn)
			showList();
		else
			$.mobile.changePage("#loginPage", {transition: 'flow'});
	});
}

function login() {
	serverLogin($('#userName').val(), $('#password').val(), function(success) {
			if (success)
				showList();
			else
				$("#loginError").text("Incorrect user-name or password.");
		}, function(err) {
			if (err.message != undefined)
				$("#loginError").text(err.message);
			else
				$("#loginError").text(err);
		});
}

function handleError(error) {
	alert("Server error:\n" + error.message);
}

function showList() {
	console.log("Initializing");
	serverGetAllContacts(function(contacts) {
		for (var i=0; i<contacts.length; i++)
			addContactToList(contacts[i]);
		$.mobile.changePage("#mainPage", {transition: 'flow'});
		var list = $('#contactList');
		list.listview('refresh');
	});
}

function showContact(id) {
	serverGetContactDetails(id, function(contactDetails) {
		$('#editContactID').val(contactDetails.id);
		$('#editContactName').val(contactDetails.name);
		$('#editContactPhone').val(contactDetails.phone);
		$.mobile.changePage("#editContactPage", {transition: 'flow'});
	});
}

function addContact() {
	var name = $('#addContactName').val();
	var phone = $('#addContactPhone').val();
	serverAddContact(name, phone, function(contactDetails) {
		addContactToList(contactDetails);
		$('#contactList').listview('refresh');
		$('#addContactName').val("");
		$('#addContactPhone').val("");
		$.mobile.back();
	}, handleError);
}

function updateContact() {
	var id = $('#editContactID').val();
	var name = $('#editContactName').val();
	var phone = $('#editContactPhone').val();
	serverUpdateContact(id, name, phone, function(contactDetails) {
		$('#contactListLink'+contactDetails.id).text(contactDetails.name);
		$.mobile.back();
	});
}

function deleteContact() {
	var id = $('#editContactID').val();
	serverDeleteContact(id, function() {
		$('#contactListItem'+id).remove();
		$.mobile.back();
	});
}

function addContactToList(contact) {
	$('#contactList')
		.append($('<li></li>')
			.attr({id: "contactListItem" + contact.id})
			.append($('<a></a>')
				.attr({id: "contactListLink" + contact.id, href: "javascript:showContact(" + contact.id + ");"})
				.text(contact.name)
			)
		);
}