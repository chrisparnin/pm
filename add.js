

chrome.tabs.getSelected(null, function(tab) {

	var url = document.getElementById("url");
	console.log( tab.url );
	url.value = tab.url;

});

$(document).ready( function () {

	console.log( "document loaded");
	setToken("5378bdbdbd6980a3e907c7b1da5e7a7ba9e05845");
	
	$("#addBtn").click( function () {

		console.log("click");
		var url = document.getElementById("url");
		var reminder = document.getElementById("reminder");

		if( url.value && reminder.value )
		{
			addTask(reminder.value, url.value );
			console.log("added");
		}
		else
		{
			console.log("error");
		}
	});
});