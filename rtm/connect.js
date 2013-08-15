var stdin = process.stdin;
var RememberTheMilk = require("./rtm.js");


var api_key = "125a2569657f22ef2105cefdfabd5c1b";
var api_secret = "3cb3d64fd76ac23d";
var rtm = new RememberTheMilk(api_key, api_secret, "read");

setToken("241d9231183124e91570729f163886c5076ea230");
getTasksInContextList();

//getToken( function(token) {
//	console.log("token:" + token);
//});

function setToken (token) 
{
	rtm.auth_token = token;
}

function getToken(onResult)
{
	rtm.get("rtm.auth.getFrob", function(resp)
	{
		var frob = resp.rsp.frob;

		console.log( resp.rsp );

			var authUrl = rtm.getAuthUrl(frob);

			console.log('Please visit the following URL in your browser to authenticate:\n');
			console.log(authUrl, '\n');
			console.log('After authenticating, press any key to resume...');

			stdin.resume();

			stdin.on('data', function() 
			{
				rtm.get('rtm.auth.getToken', {frob: frob}, function(resp)
				{
					if (!resp.rsp.auth) {
						console.log( resp.rsp );
						console.log('Auth token not found. Did you authenticate?\n');
						process.exit(1);
					}

					onResult( resp.rsp.auth.token );
				});

			});

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

		console.log();

		process.exit();
	});
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