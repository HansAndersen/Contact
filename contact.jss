function serverIsLoggedIn() {
	return !server.currentUser.isAnonymous;
}
	
function serverLogin(userName, password) {
	try {
		server.login(userName, password);
		return true;
	} catch (e) {
		return false;
	}
}
	
function serverGetAllContacts() {
	console.log("serverGetAllContacts 1");
	var db = _getDatabase();
	console.log("serverGetAllContacts 2");
	if (!_tableExists(db, "Contact"))
		db.transaction(function(tx) {
			tx.executeSql("CREATE TABLE Contact (ContactID int IDENTITY (100,1) PRIMARY KEY, Name nvarchar (50), Phone nvarchar (50));");
		});
	console.log("serverGetAllContacts 3");
	return serverGetContactList();
}

function serverGetContactList() {
	var db = _getDatabase();
	var contactList = [];
	db.readTransaction(function(tx) {
		var res = tx.executeSql("SELECT * FROM Contact ORDER BY Name;");
		var rows = res.rows;
		for (var i=0; i<rows.length; i++) {
			var row = rows[i];
			contactList.push(
				{ 
					id: row.ContactID, 
					name: row.Name, 
					phone: row.Phone
				}
			);
		}
	});
	return contactList;
}

function serverAddContact(name, phone) {
	var db = _getDatabase();
	var id = -1;
	db.transaction(function(tx) {
		var res = tx.executeSql("INSERT INTO Contact(Name, Phone) VALUES ('" + name + "', '" + phone + "');");
		id = res.insertId;
	});

	var contactDetails = {};
	db.readTransaction(function(tx) {
		var res = tx.executeSql("SELECT * FROM Contact WHERE ContactID=" + id + ";");
		if (res.rows.length<1)
			contactDetails = null;
		var row = res.rows[0];
		contactDetails.id = row.ContactID;
		contactDetails.name = row.Name;
		contactDetails.phone = row.Phone;
	});
	return contactDetails;
}

function serverGetContactDetails(id) {
	var db = _getDatabase();
	var contactDetails = {};
	db.readTransaction(function(tx) {
		var res = tx.executeSql("SELECT * FROM Contact WHERE ContactID=" + id + ";");
		if (res.rows.length<1)
			contactDetails = null;
		var row = res.rows[0];
		contactDetails.id = row.ContactID;
		contactDetails.name = row.Name;
		contactDetails.phone = row.Phone;
	});
	return contactDetails;
}

function serverUpdateContact(id, name, phone) {
	var db = _getDatabase();
	db.transaction(function(tx) {
		tx.executeSql("UPDATE Contact SET Name='" + name + "', Phone='" + phone + "' WHERE ContactID=" + id + "");
	});
	return serverGetContactList(id);
}

function serverDeleteContact(id) {
	var db = _getDatabase();
	db.transaction(function(tx) {
		tx.executeSql("DELETE FROM Contact WHERE ContactID=" + id + "");
	});
}

function _getDatabase() {
	var dbPath = "/Home/javaftp/contacts.sdf";
	return openDatabaseSync(dbPath, "");
}
	
function _tableExists(db, tableName) {
	var rowCount = 0;
	db.readTransaction(function(tx) {
		var sql = "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '" + tableName + "'";
		var res = tx.executeSql(sql);
		rowCount = res.rows.length;
	});
	return rowCount > 0;
}