function setDOMInfo(info) {
	console.log(info);
	var initial = 0;
	
	$("#assessmentMajestic").attr("data-percent", info.TrustFlow||initial);
	$("#assessmentPeople").attr("data-percent", info.VoteStat||initial);
	$("#assessmentCitations").attr("data-percent", info.CitationFlow||initial);
	
	$("#grade").text(info.Grade);
	$("#topic").text(info.Topic||"Could not decide");
	
	$("#betteridge").css("color",(info.Betteridge_legal==true)?"green":"red");
	$("#betteridge").text((info.Betteridge_legal==true)?"Betteridge legal":"Betteridge illegal");
	
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
(function ($) {
    $.fn.bar = function (options) {
		var object = $(this);
		console.log(object);
        var fill = object.find('.fill');
        var tip = object.find('.tip');
        var percentage = (object.attr('data-percentage')||50) + "%";
		fill.css("width", percentage);
		tip.css("left", percentage);
		tip.text(percentage);
		return this;
	};
})(jQuery);
//$(".page").hide();
function animate(){
	$(".animate").empty();
	$(".animate:not(#assessmentPeople)").circliful({
		animation: 1,
		animationStep: 5,
		multiPercentage: 0,
		progressColor: { 0: '#FF0000', 50: '#FFA500', 90: '#00DD00'}
	});
	$("#assessmentPeople").circliful({
		animation: 1,
		animationStep: 5,
		backgroundColor: "#FF0000",
		foregroundColor: "#00FF00"
	});
	$('.bar').each(function(){$(this).bar()});
}
var busy = false;
var viewing;
$(document).ready(function(){
	if(chrome.tabs)chrome.tabs.query({ active: true, currentWindow: true }, function callback(tabs) {
		var viewing = tabs[0].url
		var url = "http://www.faktnews.org:5000/v4?search=" + viewing;
		$.getJSON(url, function(data) {
			setDOMInfo(data);
		}).fail(function(jqXHR, textStatus, errorThrown) { console.log( "JSON Error" ); });
	});

	$('#circles a').click(function(){
		if(busy == false){
			busy = true;
			$('#circles').animate({ marginLeft: "100%", easing: "swing"} , 500);
			$('.page').animate({ marginLeft: "0%", easing: "swing"} , 500, function(){
				resizeEvent(); 
				animate();
				busy = false;
			});
		}
	});
	
	//$('#assessmentContent + a').click(function(){$('#content').show()});
	//$('#assessmentMajestic + a').click(function(){$('#majestic').show()});
	//$('#assessmentPeople + a').click(function(){$('#people').show()});
	
	$('.page a').click(function(){
		if(busy == false){
			busy = true;
			$('#circles').animate({ marginLeft: "0%", easing: "swing"} , 500);
			$('.page').animate({ marginLeft: "-100%", easing: "swing"} , 500,  function(){
				//$(".page").hide();
				resizeEvent();
				animate();
				busy = false;
			});
		}
	});
	$('#yes').click(function(event){
		if(viewing){
			var url = "http://www.faktnews.org:5000/vote/v1?url=" + viewing + "&trusted=y";
			$.getJSON(url, function(data) {}).fail(function(jqXHR, textStatus, errorThrown) { console.log( "JSON Error" ); });
		}
	});
	$('#no').click(function(event){
		if(viewing){
			var url = "http://www.faktnews.org:5000/vote/v1?url=" + viewing + "&trusted=n";
			$.getJSON(url, function(data) {}).fail(function(jqXHR, textStatus, errorThrown) { console.log( "JSON Error" ); });
		}
	});
});