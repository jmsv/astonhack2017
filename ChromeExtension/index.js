function setDOMInfo(info) {
	console.log(info);
	$("#assessmentContent").attr("data-percent", info.content);
	$("#assessmentMajestic").attr("data-percent", info.majestic);
	$("#assessmentPeople").attr("data-percent", info.people);
	$("#assessmentTrust").attr("data-percent", info.TrustFlow);
	$("#assessmentCitations").attr("data-percent", info.CitationFlow);
	$(".example").piechart([
		["Word Type", "% of words"],
		["Verb", info.verbs],
		["Adjective", info.adjectives],
		["Noun", info.nouns],
		["Other", info.other]
	]);
	$(".piechart-flatmin").on('mouseenter','.sector-s',hoverState);
	$(".piechart-flatmin").on('mouseleave','.sector-s',hoverState);
	$(".piechart-flatmin").on('click','.sector-s',clickState);
	$(window).resize(resizeEvent);
	animate();
}

$(".page").hide();
function animate(){
	$(".animate").circliful({
		animation: 1,
		animationStep: 5,
		multiPercentage: 0,
		progressColor: { 0: '#FF0000', 50: '#FFA500', 90: '#00DD00'}
	});
}
var busy = false;
$(document).ready(function(){
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
	chrome.tabs.query({ active: true, currentWindow: true }, function callback(tabs) {
		console.log(tabs[0].url);
		var url = "http://178.62.59.222:5000/v1?search=" + tabs[0].url;
		console.log(url);
		$.getJSON(url, function(data) {
			setDOMInfo(data);
		})
		.done(function(data, textStatus, jqXHR) {console.log( "Finalised" );})
		.fail(function(jqXHR, textStatus, errorThrown) { console.log( "Error" ); });
	});
});