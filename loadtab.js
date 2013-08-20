chrome.browserAction.onClicked.addListener(function() 
{
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) 
{
});


chrome.commands.getAll( function (commands) {

});

chrome.commands.onCommand.addListener( function (command) 
{

});

allTasks = 
{
	loaded: null,
	tasks : []
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

	if (request.getTasks) 
	{
		console.log( "background: received message");
		//console.log( allTasks );

		if( allTasks.loaded && allTasks.loaded > Date.now() - (24*60*60*1000))
		{
		   sendResponse({action: "tasks_loaded", tasks: allTasks.tasks });
		}
		else
		{
			setToken("5378bdbdbd6980a3e907c7b1da5e7a7ba9e05845");
			getTasksWithUrls( function( tasks )
			{
				console.log( tasks );
				allTasks.loaded = Date.now();
				allTasks.tasks = tasks;
		   	sendResponse({action: "tasks_loaded", tasks: allTasks.tasks });
			});

			// when expecting to send message asynchronously.
			return true;
		}
	}
	return false;
});

function handleMessage()
{
}

