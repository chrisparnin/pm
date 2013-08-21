$(document).ready( function () {

	$("#successParagraph").hide();

	$("#rtmBtn").click( function () {

		// UI feedback to user.
		$("#rtmBtn").attr('disabled','disabled');

		console.log("rtm clicked");

		chrome.runtime.sendMessage( {auth:true, service:'rtm'}, function(response)
		{

			$("#successParagraph").show();

		});

	});
});
