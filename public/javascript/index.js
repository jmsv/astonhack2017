(function ($) {
    $.fn.bar = function (options) {
        var object = $(this);
        var fill = object.find('.fill');
        var tip = object.find('.tip');
        var percentage = object.attr('data-percent') + "%";
        fill.css("width", percentage);
        tip.css("left", percentage);
        tip.text(percentage);
    };
    $.fn.circle = function (options) {
        var object = $(this);
        var fill = object.find('circle:nth-of-type(2)');
        var tip = object.find('text');
        var percentage = 360 - object.attr('data-percent') / 100 * 360;
        fill.css("stroke-dashoffset", percentage);
        tip.text(object.attr('data-percent') + "%");
    };
    $.fn.pie = function (options) {
        $(this).empty();
        var object = $(this), total = 0, current = 0, create = "<svg viewBox='0 0 132 132'><g>";
        for (var item in options)
            total += options[item];
        for (var item in options) {
            var angleSize = (options[item] / total) * 360;
            var rounded = Math.floor(options[item] / total * 100);
            create += `<circle tabindex='0' stroke-dashoffset='${360 - angleSize}' style='transform: rotate(${current}deg);'/><text x='63' y='63'>${options[item]} ${item} </text><text x='63' y='73'>(~${rounded}%)</text>`;
            current += angleSize;
        }
        create += "</g></svg>";
        $(this).append($(create));
    };
})(jQuery);
function setDOMInfo(info) {
    $("#assessmentMajestic").attr("data-percent", info.TrustFlow);
    $("#assessmentPeople").attr("data-percent", info.VoteStat);
    $("#assessmentCitations").attr("data-percent", info.CitationFlow);
    $("#grade").text(info.Grade);
    $("#topic").text(info.Topic);
    $("#betteridge").attr('class', info.Betteridge_legal === true ? "legal" :"");
    $("#assessmentContent").attr("data-percent", info.CVC);
    $("#subjectivity").attr("data-percent", info.Subjectivity);
    $("#polarity").attr("data-percent", info.Polarity);
}
$(function () {
    $("#betteridge").attr('class', Math.random() * 100 > 50 ? "legal" : "");
    $(".circle, .bar").each(function (index) { $(this).attr("data-percent", Math.floor(Math.random() * 100)); });
    $("#grammar").pie({ "Verbs": Math.floor(Math.random() * 100), "Nouns": Math.floor(Math.random() * 100), "Adjectives": Math.floor(Math.random() * 100), "Adverbs": Math.floor(Math.random() * 100), "Other": Math.floor(Math.random() * 100) });

    $(".circle").each(function (index) { $(this).circle(); });
    $(".bar").each(function (index) { $(this).bar(); });
});