
var api_key = "125a2569657f22ef2105cefdfabd5c1b";
var api_secret = "3cb3d64fd76ac23d";
var rtm = new RememberTheMilk(api_key, api_secret, "delete");

//setToken("241d9231183124e91570729f163886c5076ea230");
//setToken("dd7706c12f4201bab6d19c801806a2fcd869a173");
//setToken("5378bdbdbd6980a3e907c7b1da5e7a7ba9e05845");

//getTasksInContextList();

//addTask("test things", "http://checkbox.io" );

//getTasksWithUrls();



//getToken( function(token) {
//	console.log("token:" + token);
//});

function setToken (token) 
{
	rtm.auth_token = token;
}

function getAuthUrl(onResult)
{	

	rtm.get("rtm.auth.getFrob", function(resp)
	{
		var frob = resp.rsp.frob;

		console.log( resp.rsp );

		var authUrl = rtm.getAuthUrl(frob);

		onResult( frob, authUrl);
	});

}

function checkToken(token, onResult)
{
	rtm.get('rtm.auth.checkToken', {auth_token : token}, function(resp)
	{
		onResult(resp.rsp.stat);
	});	
}

function getToken(frob, onResult)
{
	rtm.get('rtm.auth.getToken', {frob: frob}, function(resp)
	{
		if (!resp.rsp.auth) 
		{
			console.log( resp.rsp );
			console.log('Auth token not found. Did you authenticate?\n');
			onResult(null);
		}

		onResult( resp.rsp.auth.token );
	});
}

function getLists()
{
	console.log('Lists:');

	rtm.get('rtm.lists.getList', function(resp){
		var i, list;

		for (i = 0; i < resp.rsp.lists.list.length; i++) {
			list = resp.rsp.lists.list[i];
			console.log(list.name + ' (id: ' + list.id + ')');
		}

		process.exit();
	});
}

function addTask(text, url, contextId, onReady)
{

	rtm.get('rtm.timelines.create', function(resp) {
		console.log(resp);
		var timeline = resp.rsp.timeline;
		rtm.get('rtm.tasks.add', {timeline:timeline,name:text}, function(resp) {
			var listId = resp.rsp.list.id;
			var taskSeriesId = resp.rsp.list.taskseries.id;
			var taskId = resp.rsp.list.taskseries.task.id;
			console.log( listId + ":" + taskSeriesId );
			console.log( resp );
			rtm.get('rtm.tasks.setURL', {timeline:timeline, list_id:listId, taskseries_id:taskSeriesId, task_id: taskId, url: url},  
			function(resp) 
			{
				console.log( resp );	

				rtm.get('rtm.tasks.setTags', 
					{timeline:timeline, list_id:listId, taskseries_id:taskSeriesId, task_id: taskId, tags: "url"}, function(resp)
				{ 
					console.log( resp );	

					onReady(formatTaskObj(resp.rsp.list.taskseries, resp.rsp.list.id));

				});
			});
		});
	});

}

function editTask (taskId, taskSeriesId, listId, newName, onReady) {

	rtm.get('rtm.timelines.create', function(resp) {
		console.log(resp);
		var timeline = resp.rsp.timeline;
		rtm.get('rtm.tasks.setName', {timeline:timeline,task_id:taskId, taskseries_id:taskSeriesId, list_id:listId, name: newName}, function(resp) {

			console.log( resp );
			onReady( resp );

		});

	});

}



function removeTask (taskId, taskSeriesId, listId, onReady) {

	rtm.get('rtm.timelines.create', function(resp) {
		console.log(resp);
		var timeline = resp.rsp.timeline;
		rtm.get('rtm.tasks.delete', {timeline:timeline,task_id:taskId, taskseries_id:taskSeriesId, list_id:listId}, function(resp) {

			console.log( resp );
			onReady();

		});

	});

}

function snoozeTask (taskId, taskSeriesId, listId, due, onReady) {

	rtm.get('rtm.timelines.create', function(resp) {
		console.log(resp);
		var timeline = resp.rsp.timeline;

		var dt = "";
		if( dt == "" )
		{
			dt = new Date();
			dt.setTime(dt.getTime() + (8*60*60*1000));
		}
		else
		{
			dt = new Date(dt);
			dt.setTime(dt.getTime() + (8*60*60*1000));
		}

		console.log( dt.toISOString() );

		rtm.get('rtm.tasks.setDueDate', {timeline:timeline,task_id:taskId, taskseries_id:taskSeriesId, due: dt.toISOString(), has_due_time: "1", list_id:listId}, function(resp) {

			console.log( resp );
			onReady();

		});

	});

}



function getTasksWithUrls(onReady)
{
	console.log("rtm.tasks.getList");

	rtm.get('rtm.tasks.getList', {filter:"tag:url"}, function(resp) {

		console.log( resp );

		var tasks = [];

		var serverTasks = resp.rsp.tasks.list || [];

		//console.log( resp.rsp.tasks.list );	
		serverTasks.map( function(elem) { 

				if( elem.taskseries instanceof Array )
				{
					for( var i=0; i < elem.taskseries.length; i++ )
					{
						var t = elem.taskseries[i];
						tasks.push( formatTaskObj(t, elem.id) );
					}
				}
				else
				{
					tasks.push( formatTaskObj(elem.taskseries, elem.id) );
				}

				//return elem.taskseries;
		});

		onReady( tasks );

	});
}

function formatTaskObj (task, list_id) {
	task["list_id"] = list_id;
	return task;
}

function getContextListId()
{
	
}

function getTasksInContextList()
{
	rtm.get('rtm.lists.getList', function(resp){
		var i, list;

		for (i = 0; i < resp.rsp.lists.list.length; i++) {
			list = resp.rsp.lists.list[i];
			if( list.name == "Context")
			{
				rtm.get('rtm.tasks.getList', {list_id: list.id}, function( resp ) {
					console.log( resp.rsp.tasks.list );
				});

				break;
			}
		}
	});
}
