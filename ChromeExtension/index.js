function setDOMInfo(info) {
	console.log(info);
	$("#assessmentContent").attr("data-percent", info.content||10);
	$("#assessmentMajestic").attr("data-percent", info.majestic||10);
	$("#assessmentPeople").attr("data-percent", info.people||10);
	$("#assessmentTrust").attr("data-percent", info.TrustFlow||10);
	$("#assessmentCitations").attr("data-percent", info.CitationFlow||10);
	$(".example").piechart([
		["Word Type", "% of words"],
		["Verb", info.verbs||10],
		["Adjective", info.adjectives||10],
		["Noun", info.nouns||10],
		["Other", info.other||10]
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
	chrome.tabs.query({ active: true, currentWindow: true }, function callback(tabs) {
		console.log(tabs[0].url);
		var url = "http://faktnews.org:5000/v1?search=" + tabs[0].url.replace(/^https?\:\/\//i, "");;
		console.log(url);
		$.getJSON(url, function(data) {
			setDOMInfo(data);
		})
		.done(function(data, textStatus, jqXHR) {console.log( "Finalised" );})
		.fail(function(jqXHR, textStatus, errorThrown) { console.log( "Error" ); });
	});

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
});