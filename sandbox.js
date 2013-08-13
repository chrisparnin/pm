function getReminder()
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://checkbox.io/api/study/listing", true);
	xhr.onreadystatechange = function() 
	{
	   if( xhr.readyState == 4 )
	   {
	      var resp = JSON.parse(xhr.responseText);

			createRelativeSticky( resp.studies[0].name );

		}
	}
	xhr.send();
}

createRelativeSticky( "A Test a test" );


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

	document.body.appendChild(element);

	var element2 = document.createElement('div');
	element2.id = "sticky";
	
	document.body.appendChild(element2);

	var sheet = document.styleSheets[0];

	sheet.insertRule(
		"{\n"+
			"#sticky\n"+
			"padding: 0.5ex;\n"+
			"width: 600px;\n"+
			"background-color: #000;\n"+
			"color: #fff;\n"+
			"font-size: 2em;\n"+
			"border-radius: 0.5ex;\n"+
		"}",
	sheet.cssRules.length);

	sheet.insertRule(
		"#sticky.stick {\n"+
			  "position: fixed;\n"+
			  "top: 0;\n"+
			  "z-index: 10000;\n"+
			  "border-radius: 0 0 0.5em 0.5em;\n"+
		"}",
	sheet.cssRules.length);
	
}

function sticky_relocate() {
  var window_top = $(window).scrollTop();
  var div_top = $('#sticky-anchor').offset().top;
  if (window_top > div_top) {
    $('#sticky').addClass('stick');
  } else {
    $('#sticky').removeClass('stick');
  }
}

$(function() {
  $(window).scroll(sticky_relocate);
  sticky_relocate();
});