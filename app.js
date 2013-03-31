function initialize() {
	server.initialize(function(contacts) {
		for (var i=0; i<contacts.length; i++)
			addContactToList(contacts[i]);
		$('#contactList').listview('refresh');
	});
}

function showContact(id) {
	server.getContactDetails(id, function(contactDetails) {
		$('#editContactID').val(contactDetails.id);
		$('#editContactName').val(contactDetails.name);
		$('#editContactPhone').val(contactDetails.phone);
		$.mobile.changePage("#editContactPage", {transition: 'flow'});
	});
}

function addContact() {
	var name = $('#addContactName').val();
	var phone = $('#addContactPhone').val();
	server.addContact(name, phone, function(contactDetails) {
		addContactToList(contactDetails);
		$('#contactList').listview('refresh');
		$('#addContactName').val("");
		$('#addContactPhone').val("");
		$.mobile.back();
	});
}

function updateContact() {
	var id = $('#editContactID').val();
	var name = $('#editContactName').val();
	var phone = $('#editContactPhone').val();
	server.updateContact(id, name, phone, function(contactDetails) {
		$('#contactListLink'+contactDetails.id).text(contactDetails.name);
		$.mobile.back();
	});
}

function deleteContact() {
	var id = $('#editContactID').val();
	server.deleteContact(id, function() {
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

// Server proxy -----------------------------------------------

server = {};

server.url = "http://192.168.1.100/DojoTest/server/contact.js";

server.initialize = function(callback) {
	this.invokeJsonRpc("initialize", null, callback);
}

server.getContactList = function(callback) {
	this.invokeJsonRpc("getContactList", null, callback);
}

server.addContact = function(name, phone, callback) {
	this.invokeJsonRpc("addContact", [ name, phone], callback);
}

server.getContactDetails = function(id, callback) {
	this.invokeJsonRpc("getContactDetails", [ id ], callback);
}

server.updateContact = function(id, name, phone, callback) {
	this.invokeJsonRpc("updateContact", [ id, name, phone], callback);
}

server.deleteContact = function(id, callback) {
	this.invokeJsonRpc("deleteContact", [ id ], callback);
}

server.handleError = function(error) {
	alert("Server error:\n" + error.message);
}

server.invokeJsonRpc = function(method, params, callback) {
	var request = {};
	request.method = method;
	request.params = params;
	request.id = 1;
	request.jsonrpc = "1.1";

	$.ajax({
		type: "POST",
		url: this.url,
		data: JSON.stringify(request),
		success: function(data) {
			returnValue = JSON.parse(data);
			if (returnValue.error)
				this.handleError(returnValue.error);
			else if (callback)
				callback(returnValue.result);
		},
		contentType: "application/json"
	});
}