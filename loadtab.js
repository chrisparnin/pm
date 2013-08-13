chrome.browserAction.onClicked.addListener(function() 
{
	chrome.tabs.executeScript({
		file: "sandbox.js",
	});

	/*
   chrome.tabs.create({url: chrome.extension.getURL('app.html') }, function(tab)
   {
   });
	*/
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) 
{
	if (changeInfo.status == 'complete' && tab.active) 
	{
		chrome.tabs.executeScript(null, {
			file: "sandbox.js",
		});
	}
});