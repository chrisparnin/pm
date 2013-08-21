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

	if( request.refresh )
	{
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

	if( request.editTask )
	{
			editTask (request.taskId, request.taskSeriesId, request.listId, request.value, function (resp) {

				if( resp.rsp.stat == "ok" )
				{
					for( var i=0; i < allTasks.tasks.length; i++ )
					{
						var task = allTasks.tasks[i];
						if( task.task.id == request.taskId && task.id == request.taskSeriesId && task.list_id == request.listId)
						{
							task.name = request.value;
							break;
						}
					}
				}

			});
	}

	if( request.addTask )
	{

		addTask(request.reminder, request.url, null, function(newTask)
		{
			console.log("added");
			// let popup know it can close...
			sendResponse({});

			// set null so all will be reloaded from source.
			allTasks.tasks.push( newTask );

			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage( tabs[0].id, {reload:true}, function(response)
				{
					console.log("received reload request");
				});
			});
		});

		return true;
	}

	return false;
});

