function getReminder()
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://checkbox.io/api/study/listing", true);
	xhr.onreadystatechange = function() 
	{
	   if( xhr.readyState == 4 )
	   {
	      var resp = JSON.parse(xhr.responseText);

			createSticky( resp.studies[0].name );
			createRelativeSticky( resp.studies[0].name );

		}
	}
	xhr.send();
}

setToken("5378bdbdbd6980a3e907c7b1da5e7a7ba9e05845");
getTasksWithUrls( function( tasks )
{
	console.log( tasks );
	for( var i=0; i < tasks.length; i++ )
	{
		var task = tasks[i];
		if( location.href.indexOf(task.url) == 0 )
		{
			//createSticky("Hello");
			createRelativeSticky( task.name );
		}
	}
});

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

function createRelativeSticky( name )
{
	var element = document.createElement('div');
	element.id = "sticky-anchor";
	element.style.position = "absolute";
	element.style.top = "40px";
	element.style.right = "40px";	
	document.body.appendChild(element);

	var element2 = document.createElement('div');
	element2.id = "sticky";
	element2.style.position = "absolute";
	element2.style.top = "40px";
	element2.style.right = "40px";	

	element2.innerText = name;
	
	document.body.appendChild(element2);

	var style = document.createElement('link');
	style.rel = 'stylesheet';
	style.type = 'text/css';
	style.href = chrome.extension.getURL('sticky.css');
	(document.head||document.documentElement).appendChild(style);

}


function sticky_relocate() {
  var window_top = $(window).scrollTop();
  //var div_top = $('#sticky-anchor').offset().top;

  //console.log("scroll:" + window_top + ":" + div_top );

	if (window_top > 40) {
  //if (window_top > div_top) {
    $('#sticky').addClass('stick');
    $('#sticky').attr('style', '');
  } else {
    $('#sticky').removeClass('stick');
    $('#sticky').attr('style', 'right:40px;top:40px;position:absolute;');
  }

}

$(function() {
  $(window).scroll(sticky_relocate);
  sticky_relocate();
});