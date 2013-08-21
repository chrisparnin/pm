

//setToken("5378bdbdbd6980a3e907c7b1da5e7a7ba9e05845");

chrome.runtime.sendMessage( {getOptions:true}, function(response)
{

	if( response.options.token )
	{		
		setToken(response.options.token);		
		requestTasksFromChrome();
	}

});

function requestTasksFromChrome () 
{

	chrome.runtime.sendMessage( {getTasks:true}, function(response)
	{
		if( response.action == "tasks_loaded" )
		{
			loadTasks( response.tasks );
		}

	});

}

function refreshTasksFromChrome () 
{

	chrome.runtime.sendMessage( {refresh:true}, function(response)
	{
		if( response.action == "tasks_loaded" )
		{
			loadTasks( response.tasks );
		}

	});

}


chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) 
{
	console.log( "request from extension" );
	console.log( request );

	if ( request.reload ) 
	{
		console.log("content script sent message to request reload.");
		requestTasksFromChrome();

		sendResponse({});
	}

	return true;
});


function loadTasks ( tasks ) 
{
	var freq = {};

	$(".sticky").each(function () 
	{
		$(this).remove();
	});

	for( var i=0; i < tasks.length; i++ )
	{
		var task = tasks[i];
		if( location.href.indexOf(task.url) == 0 )
		{
			if( !freq.hasOwnProperty(task.url) )
			{
				freq[task.url] = 0;
			}

			var due = Date.now() ;
			if( task.task.due != "" )
			{
				due = new Date(task.task.due);
			}

			if( due <= Date.now() )
			{
				createRelativeSticky( task.task.id, task.list_id, task.id, task.name, task.task.due, freq[task.url] );
				freq[task.url]++;
			}
		}
	}

	if( !document.getElementById("stick-stylesheet") )
	{
		var style = document.createElement('link');
		style.id = "stick-stylesheet"
		style.rel = 'stylesheet';
		style.type = 'text/css';
		style.href = chrome.extension.getURL('css/sticky.css');
		(document.head||document.documentElement).appendChild(style);

		style = document.createElement('link');
		style.id = "font-awesome-stylesheet"
		style.rel = 'stylesheet';
		style.type = 'text/css';
		style.href = chrome.extension.getURL('css/font-awesome.css');
		(document.head||document.documentElement).appendChild(style);

	}

	// Make sure properly positioned.
	sticky_relocate();
}



var colors = ["rgba(222,78,113,.5)", "rgba(0,124,146,.5)", "rgba(255,210,54,0.5)"];

function createSticky( name )
{
	var element = document.createElement('div');
	element.style.position = "absolute";
	element.style.top = "40px";
	element.style.right = "40px";
	element.style.background = "rgba(255,210,54,.5)";

	element.style.padding = "40px";
	element.style.zIndex = "2147483647";
	element.innerText = name;

	document.body.appendChild(element);
}

function createRelativeSticky( id, listId, taskSeriesId, name, due, itemNumber )
{
	var color = colors[Math.floor(Math.random()*colors.length)];

	// task ID
	$("<div></div>")
		.attr("id", id)
		.addClass("sticky")
		.css("position","absolute")
		.css("top","40px")
		.css("right","40px")
		.css("background-color", color)
    	.css('margin-top', (itemNumber * 40) + "px" )
		.appendTo( "body" )
		.data('item', itemNumber)
		.data('listId', listId)
		.data('taskSeriesId', taskSeriesId)
		.data('due', due );

	var sticky = $("#"+id);
	sticky.append('<span>'+name+'</span>' );

	sticky.on('mouseenter', function() 
	{
		$(this).find('.stickyBtn').each(function () 
		{
			$(this).show();
		});
	});

	sticky.on('mouseleave', function() 
	{
		$(this).find('.stickyBtn').each(function () 
		{
			$(this).hide();
		});
	});


	sticky.find('span').editable(function(value, settings) { 

			// Let background page do work...and handle update.
			chrome.runtime.sendMessage( {editTask:true, taskId:id, taskSeriesId:taskSeriesId, listId:listId, value:value}, function(response)
			{
				// UI is updated right away, but server will take a second...


			});

	     return(value);

	  }, { 
	     type    : 'text',
	     submit  : 'OK',
	 });


	$('<i class="stickyBtn icon-remove"></i>').on('click',
		function () {
			var listId = sticky.data('listId');
			var taskSeriesId = sticky.data('taskSeriesId');
			var taskId = sticky.attr("id");

			removeTask (taskId, taskSeriesId, listId, function (argument) {

				console.log("Deleted");

				sticky.remove();

				refreshTasksFromChrome();

			});

		}).appendTo("#"+id);

	$('<i class="stickyBtn icon-bell-alt"></i>').on('click',
		function () {
			var listId = sticky.data('listId');
			var taskSeriesId = sticky.data('taskSeriesId');
			var due = sticky.data('due');
			var taskId = sticky.attr("id");

			console.log("snoozing...")

			snoozeTask (taskId, taskSeriesId, listId, due, function () {

				console.log("snoozed");

				refreshTasksFromChrome();

			});

		}).appendTo("#"+id);


    $('.sticky .stickyBtn').each(function () {
		$(this).hide();    	
    });
	
}




function sticky_relocate() {
  var window_top = $(window).scrollTop();
  //var div_top = $('#sticky-anchor').offset().top;

  //console.log("scroll:" + window_top + ":" + div_top );

	if (window_top >= 40) {
  //if (window_top > div_top) {
    //$('.sticky').addClass('stick');
    //$('.sticky').attr('style', 'margin-top:' + (($(".sticky").data('item') +1) * 40) + "px;" );

    $('.sticky').each(function () 
    {
    	$(this).addClass('stick');
    	$(this)
    		.css('position','fixed')
    		.css('top', '0px')
    		.css('margin-top', (($(this).data('item') ) * 40) + "px" );
    });

  } else {
   //$('.sticky').removeClass('stick');
   //$('.sticky').attr('style', 'right:40px;top:40px;position:absolute;');
    $('.sticky').each(function () 
    {
   	$(this).removeClass('stick');
   	$(this)
   		.css('position', 'absolute')
    		.css('top', '40px')
   		.css('margin-top', (($(this).data('item') ) * 40) + "px");
    });
  }

}

$(document).ready( function() {

  $(window).scroll(sticky_relocate);
  sticky_relocate();

});