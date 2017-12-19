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
})(jQuery);
function setDOMInfo(info) {
    $("#assessmentMajestic").attr("data-percent", info.TrustFlow);
    $("#assessmentPeople").attr("data-percent", info.VoteStat);
    $("#assessmentCitations").attr("data-percent", info.CitationFlow);
    $("#grade").text(info.Grade);
    $("#topic").text(info.Topic);
    $("#betteridge").css("color", info.Betteridge_legal === true ? "green" : "red");
    $("#betteridge").text(info.Betteridge_legal === true ? "Betteridge legal" : "Betteridge illegal");
    $("#assessmentContent").attr("data-percent", info.CVC);
    $("#subjectivity").attr("data-percent", info.Subjectivity);
    $("#polarity").attr("data-percent", info.Polarity);
}
$(function () {
    $(".circle, .bar").each(function (index) { $(this).attr("data-percent", Math.floor(Math.random() * 100)); });
    $(".circle").each(function (index) { $(this).circle(); });
    $(".bar").each(function (index) { $(this).bar(); });
});