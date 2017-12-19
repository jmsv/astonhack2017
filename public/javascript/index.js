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
    }
})(jQuery);
function setDOMInfo(info) {
    console.log(info);
    var initial = 75;
    $("#assessmentMajestic").attr("data-percent", (info) ? info.TrustFlow : initial);
    $("#assessmentPeople").attr("data-percent", (info) ? info.VoteStat : initial);
    $("#assessmentCitations").attr("data-percent", (info) ? info.CitationFlow : initial);
    $("#grade").text((info) ? info.Grade : 'C');
    $("#topic").text((info) ? info.Topic : 'EVERYTHING :D');
    $("#betteridge").css("color", (info) ? ((info.Betteridge_legal == !0) ? "green" : "red") : "blue");
    $("#betteridge").text((info && info.Betteridge_legal == !0) ? "Betteridge legal" : "Betteridge illegal");
    $("#assessmentContent").attr("data-percent", (info) ? info.CVC : initial);
    $("#subjectivity").attr("data-percent", (info) ? info.Subjectivity : initial);
    $("#polarity").attr("data-percent", (info) ? info.Polarity : initial);
    $(".example").piechart([["", ""], ["Verb", (info) ? info.Grammar.Verb : initial], ["Adjective", (info) ? info.Grammar.Adjective : initial], ["Adverb", (info) ? info.Grammar.Adverb : initial], ["Noun", (info) ? info.Grammar.Noun : initial], ["Other", (info) ? info.Grammar.Other : initial]]); $(".piechart-flatmin").on('mouseenter', '.sector-s', hoverState);
    $(".piechart-flatmin").on('mouseleave', '.sector-s', hoverState);
    $(".piechart-flatmin").on('click', '.sector-s', clickState);
    $(window).resize(resizeEvent);
    $("#loading").hide();
    show('circles');
}

function show(id) {
    var object = $('#' + id); $('#move').css("left", "-" + object.css("left")); $('#move').css("top", "-" + object.css("top")); $('#' + id + " .animate").each(function () {
        if ($(this).is(':empty'))
            if ($(this).is("#assessmentPeople"))
                $(this).circliful({ animation: 1, animationStep: 5, backgroundColor: "#FF0000", foregroundColor: "#00DD00" });
            else $(this).circliful({ animation: 1, animationStep: 5, multiPercentage: 0, progressColor: { 0: '#FF0000', 50: '#FFA500', 90: '#00DD00' } })
    }); $('#' + id + ' .bar').each(function () { $(this).bar() })
}
$(document).ready(function () {
    var viewing;
    if (chrome.tabs)
        chrome.tabs.query({ active: !0, currentWindow: !0 }, function callback(tabs) {
            viewing = tabs[0].url
            var url = "http://www.faktnews.org:5000/v4?search=" + viewing;
            $.getJSON(url, function (data) { setDOMInfo(data) }).fail(function (jqXHR, textStatus, errorThrown) { $("#error").show() })
        });
    else {
        setDOMInfo(null);
        $("#loading").hide();
        $("#viewport").css("overflow", "visible");
        $("#move").css("position", "static")
    }
    $('a').click(function () {
        show($(this).attr("data-show"))
    });
    $('input').click(function (event) {
        if (viewing) {
            var url = "http://www.faktnews.org:5000/vote/v2?url=" + encodeURIComponent(viewing) + "&trusted=" + ($(this).is("#yes") == !0 ? 'y' : 'n');
            $.getJSON(url, function (data) {
                var container = $('#assessmentPeople').parent();
                $('#assessmentPeople').remove(); container.append('<div id="assessmentPeople" class="animate"></div>');
                $("#assessmentPeople").attr("data-percent", data.VoteStat); show('circles')
            }).fail(function (jqXHR, textStatus, errorThrown) { $("#error").show() })
        }
    })
})