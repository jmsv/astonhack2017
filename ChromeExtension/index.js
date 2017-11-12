function setDOMInfo(info) {
	console.log(info);
	var initial = 0;
	
	$("#assessmentMajestic").attr("data-percent", info.TrustFlow||initial);
	$("#assessmentPeople").attr("data-percent", info.people||initial);
	$("#assessmentCitations").attr("data-percent", info.CitationFlow||initial);
	
	$("#grade").text(info.Grade);
	$("#topic").text(info.Topic);
	
	var grammar = info.Grammar;
	$("#assessmentContent").attr("data-percent", info.CVC);
	$("#subjectivity .fill").attr("data-percentage", info.Subjectivity);
	$("#polarity .fill").attr("data-percentage", info.Polarity);
	$(".example").piechart([
		["", ""],
		["Verb", grammar.Verb],
		["Adjective", grammar.Adjective],
		["Adverb", grammar.Adverb],
		["Noun", grammar.Noun],
		["Other",grammar.Other]
	]);
	$(".piechart-flatmin").on('mouseenter','.sector-s',hoverState);
	$(".piechart-flatmin").on('mouseleave','.sector-s',hoverState);
	$(".piechart-flatmin").on('click','.sector-s',clickState);
	$(window).resize(resizeEvent);	
	animate();
}

$(".page").hide();
function animate(){
	$(".animate").empty();
	$(".animate").circliful({
		animation: 1,
		animationStep: 5,
		multiPercentage: 0,
		progressColor: { 0: '#FF0000', 50: '#FFA500', 90: '#00DD00'}
	});
	$('#subjectivity').barfiller();
	$('#polarity').barfiller();
}
var busy = false;
$(document).ready(function(){
	chrome.tabs.query({ active: true, currentWindow: true }, function callback(tabs) {
		var url = "http://faktnews.org:5000/v4?search=" + tabs[0].url;
		$.getJSON(url, function(data) {
			setDOMInfo(data);
		}).fail(function(jqXHR, textStatus, errorThrown) { console.log( "JSON Error" ); });
	});

	$('#circles a').click(function(){
		if(busy == false){
			busy = true;
			$('#circles').animate({ marginLeft: "100%", easing: "swing"} , 500);
			$('.page').animate({ marginLeft: "0%", easing: "swing"} , 500, function(){resizeEvent(); animate(); busy = false;});
		}
	});
	
	$('#assessmentContent + a').click(function(){$('#content').show()});
	$('#assessmentMajestic + a').click(function(){$('#majestic').show()});
	$('#assessmentPeople + a').click(function(){$('#people').show()});
	
	$('.page a').click(function(){
		if(busy == false){
			busy = true;
			$('#circles').animate({ marginLeft: "0%", easing: "swing"} , 500);
			$('.page').animate({ marginLeft: "-100%", easing: "swing"} , 500,  function(){$(".page").hide();resizeEvent();animate();busy = false;});
		}
	});
});