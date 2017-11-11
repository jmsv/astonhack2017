$(".page").hide();
$(".animate").circliful();
$(document).ready(function(){
	$('a').click(function(){
		$('#circles').hide('slide', { direction: 'right', easing: 'swing' }, 800, function(){});
		$(".page").animate({'left' : "0%"});
	});
});