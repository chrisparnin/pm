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
		// try one more time but from local.
		chrome.storage.local.get(OptionsStorageKey, function(entry) 
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
				}
			}
			else
			{
				chrome.tabs.create({'url': chrome.extension.getURL('auth.html')}, function(tab) {
				  // Tab opened.
				});				
			}
		});
	}
	else
	{
		// if token invalid refresh
		checkToken( options.token, function(status)
		{
			if( status != "ok" )
			{
				chrome.tabs.create({'url': chrome.extension.getURL('auth.html')}, function(tab) {
					  // Tab opened.
				});
			}
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

						// let popup know refreshed.
						sendResponse({});
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

	if( request.setBadge )
	{

		var imageElement = new Image();
		imageElement.onload = function()
		{
         try 
         {
            var w = imageElement.width;
            var h = imageElement.height;

            var canvas = document.createElement('canvas');
				canvas.width = w;
				canvas.height = h;

            var context = canvas.getContext('2d');

            context.clearRect(0, 0, w, h);
            context.drawImage(imageElement, 0, 0, w, h);

            var opt =  {w:w/1.5,h:h/1.5,x:w/3,y:h/3,n:request.n};
            opt.bgColor = hexToRgb("#d00");
    			opt.textColor = hexToRgb("#fff");
    			opt.o = 1;

            circleBadge( opt, context );

            var url = canvas.toDataURL('image/png');
				sendResponse({action:"loadBadge", src: url});
         }
         catch(e) 
         {
             throw e;
             console.error('Error setting image...', e);
         }
   	};

   	//imageElement.src = request.src;
   	imageElement.src = "chrome://favicon/" + request.src;

   	return true;
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

	chrome.storage.local.set( param , function() {
		if( chrome.runtime.lastError )
		{
			console.log(chrome.runtime.lastError.message);
			alert(chrome.runtime.lastError.message);
		}
	});
}

function circleBadge(opt, context) 
{
	var more = (opt.n > 9);
	if (more) {
	   opt.x = opt.x - opt.w * .4;
	   opt.w = opt.w * 1.4;
	}
	//console.log('circle', opt);
	//reset
	context.beginPath();
	context.font = "bold " + Math.floor(opt.h) + "px sans-serif";
	context.textAlign = 'center';
	if (more) {
	   context.moveTo(opt.x + opt.w / 2, opt.y);
	   context.lineTo(opt.x + opt.w - opt.h / 2, opt.y);
	   context.quadraticCurveTo(opt.x + opt.w, opt.y, opt.x + opt.w, opt.y + opt.h / 2);
	   context.lineTo(opt.x + opt.w, opt.y + opt.h - opt.h / 2);
	   context.quadraticCurveTo(opt.x + opt.w, opt.y + opt.h, opt.x + opt.w - opt.h / 2, opt.y + opt.h);
	   context.lineTo(opt.x + opt.h / 2, opt.y + opt.h);
	   context.quadraticCurveTo(opt.x, opt.y + opt.h, opt.x, opt.y + opt.h - opt.h / 2);
	   context.lineTo(opt.x, opt.y + opt.h / 2);
	   context.quadraticCurveTo(opt.x, opt.y, opt.x + opt.h / 2, opt.y);
	} else {
	   context.arc(opt.x + opt.w / 2, opt.y + opt.h / 2, opt.h / 2, 0, 2 * Math.PI);
	}
	context.fillStyle = 'rgba(' + opt.bgColor.r + ',' + opt.bgColor.g + ',' + opt.bgColor.b + ',' + opt.o + ')';
	context.fill();
	context.closePath();
	context.beginPath();
	context.stroke();
	context.fillStyle = 'rgba(' + opt.textColor.r + ',' + opt.textColor.g + ',' + opt.textColor.b + ',' + opt.o + ')';
	context.fillText((more) ? '9+' : opt.n, Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * 0.15));
	context.closePath();
};

//http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb#answer-5624139
//HEX to RGB convertor
function hexToRgb(hex) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
  });
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r : parseInt(result[1], 16),
      g : parseInt(result[2], 16),
      b : parseInt(result[3], 16)
  } : false;
};
