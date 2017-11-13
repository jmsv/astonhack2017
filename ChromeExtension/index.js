function setDOMInfo(info) {
	console.log(info);
	var initial = 0;
	
	$("#assessmentMajestic").attr("data-percent", info.TrustFlow||initial);
	$("#assessmentPeople").attr("data-percent", info.VoteStat||initial);
	$("#assessmentCitations").attr("data-percent", info.CitationFlow||initial);
	
	$("#grade").text(info.Grade);
	$("#topic").text(info.Topic);
	
	$("#betteridge").css("color",(info.Betteridge_legal==true)?"green":"red");
	$("#betteridge").text((info.Betteridge_legal==true)?"Betteridge legal":"Betteridge illegal");
	
	var grammar = info.Grammar;
	$("#assessmentContent").attr("data-percent", info.CVC);
	$("#subjectivity").attr("data-percent", info.Subjectivity);
	$("#polarity").attr("data-percent", info.Polarity);
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
	
	$("#loading").hide();
	show('circles');
}
(function ($) {
    $.fn.bar = function (options) {
		var object = $(this);
        var fill = object.find('.fill');
        var tip = object.find('.tip');
        var percentage = (object.attr('data-percent')) + "%";
		fill.css("width", percentage);
		tip.css("left", percentage);
		tip.text(percentage);
		return this;
	};
})(jQuery);
function show(id){
	var object = $('#'+id);
	$('#move').css("left","-"+object.css("left"));
	$('#move').css("top","-"+object.css("top"));
	
	$('#'+id+" .animate").each(function(){
		if( $(this).is(':empty') )
			if ($(this).is("#assessmentPeople"))
				$(this).circliful({
					animation: 1,
					animationStep: 5,
					backgroundColor: "#FF0000",
					foregroundColor: "#00FF00"
				});
			else 
				$(this).circliful({
					animation: 1,
					animationStep: 5,
					multiPercentage: 0,
					progressColor: { 0: '#FF0000', 50: '#FFA500', 90: '#00DD00'}
				});
	});
	$('#'+id+' .bar').each(function(){$(this).bar()});
}
$(document).ready(function(){
	var viewing;
	if(chrome.tabs)chrome.tabs.query({ active: true, currentWindow: true }, function callback(tabs) {
		viewing = tabs[0].url
		var url = "http://www.faktnews.org:5000/v4?search=" + viewing;
		$.getJSON(url, function(data) { setDOMInfo(data) }).fail(function(jqXHR, textStatus, errorThrown) { $("#error").show(); });
	});
	else $("#error").show(); 
	$('a').click(function(){show($(this).attr("data-show"))});
	$('input').click(function(event){
		console.log('click '+viewing);
		if(viewing){
			var url = "http://www.faktnews.org:5000/vote/v1?url=" + viewing + "&trusted=" + ($(this).is("#yes")==true?'y':'n');
			console.log(url);
			$.getJSON(url, function(data) {}).fail(function(jqXHR, textStatus, errorThrown) { $("#error").show(); });
		}
	});
});