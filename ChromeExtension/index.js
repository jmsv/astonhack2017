$(".page").hide();
function animate(){
	$(".animate").circliful({
		animation: 1,
		animationStep: 5,
		multiPercentage: 0,
		progressColor: { 0: '#FF0000', 50: '#FFA500', 90: '#00DD00'},
	
	});
}
var busy = false;
$(document).ready(function(){
	animate();
	$('#circles a').click(function(){
		if(busy == false){
			busy = true;
			$('#circles').animate({ marginLeft: "100%", easing: "swing"} , 500);
			$('.page').animate({ marginLeft: "0%", easing: "swing"} , 500, function(){resizeEvent(); busy = false;});
			$(".animate").empty();
			animate();
		}
	});
	
	$('#assessmentContent + a').click(function(){$('#content').show()});
	$('#assessmentMajestic + a').click(function(){$('#majestic').show()});
	$('#assessmentPeople + a').click(function(){$('#people').show()});
	
	$('.page a').click(function(){
		if(busy == false){
			busy = true;
			$('#circles').animate({ marginLeft: "0%", easing: "swing"} , 500);
			$('.page').animate({ marginLeft: "-100%", easing: "swing"} , 500,  function(){$(".page").hide();resizeEvent();busy = false;});
			$(".animate").empty();
			animate();
		}
	});
	
	$(".example").piechart([
		["Word Type", "% of words"],
		["Verb", 35],
		["Adjective", 25],
		["Noun", 15],
		["Other", 25]
	]);
	$(".piechart-flatmin").on('mouseenter','.sector-s',hoverState);
	$(".piechart-flatmin").on('mouseleave','.sector-s',hoverState);
	$(".piechart-flatmin").on('click','.sector-s',clickState);
	$(window).resize(resizeEvent);
});