$(".page").hide();
function animate(){
	$(".animate").circliful({
		animation: 1,
		animationStep: 5,
		multiPercentage: 0,
		progressColor: { 0: '#FF0000', 50: '#FFA500', 90: '#00FF00'},
		iconPosition: 'middle'
	});
}
var busy = false;
$(document).ready(function(){
	animate();
	$('#circles a').click(function(){
		if(busy == false){
			busy = true;
			$('#circles').animate({ marginLeft: "100%", easing: "swing"} , 1000);
			$('.page').animate({ marginLeft: "0%", easing: "swing"} , 1000, function(){busy = false;});
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
			$('#circles').animate({ marginLeft: "0%", easing: "swing"} , 1000);
			$('.page').animate({ marginLeft: "-100%", easing: "swing"} , 1000,  function(){$(".page").hide();busy = false;});
			$(".animate").empty();
			animate();
		}
	});
});