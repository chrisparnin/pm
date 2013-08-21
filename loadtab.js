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

	if( options.token == null )
	{

	}
	/*
    "load": 
    {
      "suggested_key": 
      {
        "default": "Ctrl+M",
        "mac": "Command+M"
      },
      "description": "Open PM settings or action page."
    },
	*/

});


chrome.runtime.onInstalled.addListener(function ()
{

	if( options.token == null )
	{

		chrome.tabs.create({'url': chrome.extension.getURL('auth.html')}, function(tab) {
		  // Tab opened.
		});

	}

});


var options = 
{
	token: null
};

var allTasks = 
{
	loaded: null,
	tasks : []
};

var OptionsStorageKey = "PM.V1.Options";

loadOptions( function()
{
	// timing issues...	
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

   if( request.auth )
   {
   	if( request.service == "rtm" )
   	{

   		getAuthUrl( function(frob, authUrl)
   		{
   			// blocking...
				window.showModalDialog( authUrl );

				// get token...
				getToken(frob, function(token){

					if( token != null )
					{

						//setToken("5378bdbdbd6980a3e907c7b1da5e7a7ba9e05845");
						setToken( token );

						options.token = token;

						saveOptions({token: token});

						sendResponse({token:token});
					}

				});

   		});

   		return true;
   	}
   }

   if( request.getOptions )
   {
		sendResponse({options:options});
		return true;
   }


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

			// sent from popup, so needs to send tab the message.
			if( request.fromPopup )
			{
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					console.log( tabs );
					chrome.tabs.sendMessage( tabs[0].id, {reload:true}, function(response)
					{
						if( chrome.runtime.lastError )
						{
							console.log( chrome.runtime.lastError.message );
						}
						console.log(response);
					});
				});
			}
			else
			{
				// send back to content script.
		   	sendResponse({action: "tasks_loaded", tasks: allTasks.tasks });
		   }
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

			allTasks.tasks.push( newTask );

			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				console.log( tabs );
				chrome.tabs.sendMessage( tabs[0].id, {reload:true}, function(response)
				{
					if( chrome.runtime.lastError )
					{
						console.log( chrome.runtime.lastError.message );
					}
					console.log(response);

					// let popup know it can close...
					sendResponse({});
				});
			});
		});

		return true;
	}

	return false;
});

function loadOptions(onReady)
{
	// load previous settings.
	chrome.storage.sync.get(OptionsStorageKey, function(entry) 
	{
		// Set previous options.
		var optionsStr = entry[OptionsStorageKey];
		if( optionsStr )
		{
			console.log( optionsStr );
		    var opts = JSON.parse( optionsStr );
		    {

				setToken( opts.token );

				options.token = opts.token;

				onReady();

		    }
		}
	});
}

function saveOptions(options)
{
	// Save it using the Chrome extension storage API.
	var json = JSON.stringify( options );
	var param = {};
	param[OptionsStorageKey] = json;
	chrome.storage.sync.set( param , function() {
		if( chrome.runtime.lastError )
		{
			console.log(chrome.runtime.lastError.message);
			alert(chrome.runtime.lastError.message);
		}
	});
}


