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

			createRelativeSticky( task.name, freq[task.url] );

			freq[task.url]++;
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

function createRelativeSticky( name, itemNumber )
{
	var element = document.createElement('div');
	element.setAttribute("class", "sticky-anchor");
	element.style.position = "absolute";
	element.style.top = "40px";
	element.style.right = "40px";
	document.body.appendChild(element);

	var element2 = document.createElement('div');
	element2.setAttribute("class", "sticky");
	element2.style.position = "absolute";
	element2.style.top = "40px";
	element2.style.right = "40px";	
	element2.dataset.item = itemNumber;

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
    //$('.sticky').addClass('stick');
    //$('.sticky').attr('style', 'margin-top:' + (($(".sticky").data('item') +1) * 40) + "px;" );

    $('.sticky').each(function () 
    {
    	$(this).addClass('stick');
    	$(this).attr('style', 'margin-top:' + (($(this).data('item') ) * 40) + "px;" );
    });

  } else {
   //$('.sticky').removeClass('stick');
   //$('.sticky').attr('style', 'right:40px;top:40px;position:absolute;');
    $('.sticky').each(function () 
    {
   	$(this).removeClass('stick');
   	$(this).attr('style', 'right:40px;top:40px;position:absolute;' + 'margin-top:' + (($(this).data('item') ) * 40) + "px;");
    });


  }

}

$(function() {
  $(window).scroll(sticky_relocate);
  sticky_relocate();
});