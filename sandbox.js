setToken("5378bdbdbd6980a3e907c7b1da5e7a7ba9e05845");
getTasksWithUrls( function( tasks )
{
	console.log( tasks );

	var freq = {};

	for( var i=0; i < tasks.length; i++ )
	{
		var task = tasks[i];
		if( location.href.indexOf(task.url) == 0 )
		{
			//createSticky("Hello");
			if( !freq.hasOwnProperty(task.url) )
			{
				freq[task.url] = 0;
			}

			createRelativeSticky( task.task.id, task.list_id, task.id, task.name, freq[task.url] );

			freq[task.url]++;
		}
	}

	if( !document.getElementById("stick-stylesheet") )
	{
		var style = document.createElement('link');
		style.id = "stick-stylesheet"
		style.rel = 'stylesheet';
		style.type = 'text/css';
		style.href = chrome.extension.getURL('sticky.css');
		(document.head||document.documentElement).appendChild(style);
	}

});

var colors = ["rgba(222,78,113,.5)", "rgba(0,124,146,.5)", "rgba(255,210,54,0.5)"];

function createSticky( name )
{
	var element = document.createElement('div');
	element.style.position = "absolute";
	element.style.top = "40px";
	element.style.right = "40px";
	element.style.background = "rgba(255,210,54,.5)";

	element.style.padding = "50px";
	element.style.zIndex = "2147483647";
	element.innerText = name;

	document.body.appendChild(element);
}

function createRelativeSticky( id, listId, taskSeriesId, name, itemNumber )
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
		.attr('margin-top', (($(this).data('item') ) * 40) + "px" )
		.appendTo( "body" )
		.data('item', itemNumber)
		.data('listId', listId)
		.data('taskSeriesId', taskSeriesId);

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


	$('<button id="remBtn" class="stickyBtn">Rem</button>').on('click',
		function () {
			var listId = sticky.data('listId');
			var taskSeriesId = sticky.data('taskSeriesId');
			var taskId = sticky.attr("id");

			removeTask (taskId, taskSeriesId, listId, function (argument) {

				console.log("Deleted");

				sticky.remove();

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

	if (window_top > 40) {
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

$(function() {
  $(window).scroll(sticky_relocate);
  sticky_relocate();
});