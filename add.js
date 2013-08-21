chrome.tabs.getSelected(null, function(tab) {

	var url = document.getElementById("url");
	console.log( tab.url );
	url.value = tab.url;

});


$(document).ready( function () {

	console.log( "document loaded");

	
	$("#addBtn").click( function () {

		var url = document.getElementById("url");
		var reminder = document.getElementById("reminder");

		if( url.value && reminder.value )
		{
			// UI feedback to user.
			$("#addBtnContent").text("Adding...");
			$("#addBtn").attr('disabled','disabled');

			// Let background page do work...even if dismissed.
			chrome.runtime.sendMessage( {addTask:true, url:url.value, reminder:reminder.value}, function(response)
			{
				console.log("sent background add Task request");
				window.close();
			});
		}
		else
		{
			console.log("error");
		}
	});
});