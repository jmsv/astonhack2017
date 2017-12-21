(function ($) {
    $.fn.bar = function (options) {
        $(this).empty().append($('<span class="tip"></span><span class="fill"></span>'));
        var fill = $(this).find('.fill'),
            tip = $(this).find('.tip');
        if ($(this).attr('data-value') !== "Error") {
            var value = new Number($(this).attr('data-value')).toPrecision(3),
                max = new Number($(this).attr("data-max")) || 100,
                min = new Number($(this).attr("data-min")) || 0,
                origin = 100 * (new Number($(this).attr("data-origin")) - min || -min) / (max - min),
                width = Math.abs(100 * value / (max - min));
            tip.text(value);
            fill.css({ "left": origin + "%" }).animate({ "width": width + "%", "left": (value < 0 ? origin - width : origin) + "%" }, 1000);
            tip.css({ "left": origin + "%" }).animate({ "left": (value < 0 ? origin - width : origin + width) + "%" }, 1000);
        } else {
            fill.css("width", 0);
            tip.css("left", "50%");
            tip.text("Error");             
        }
    };
    $.fn.circle = function (options) {
        $(this).empty().append($('<svg viewBox="0 0 126 126"><g><circle/><circle/><text x="63"y="63"></text></g></svg>'));
        var fill = $(this).find('circle:nth-of-type(2)'),
            tip = $(this).find('text');
        if ($(this).attr('data-value') !== "Error") {
            var value = new Number($(this).attr('data-value')).toPrecision(3),
                max = new Number($(this).attr("data-max") || 100),
                min = new Number($(this).attr("data-min") || 0),
                percentage = 360 - 360 * value / (max - min);
            
            fill.animate({ "stroke-dashoffset": percentage }, 1000);
            tip.text(value + "%");
            fill.css("animation-iteration-count", value / (max - min));
            fill.css("animation-play-state", "running");
        } else {
            fill.css("stroke-dashoffset", 360);
            tip.text("Error");
        }
    };
    $.fn.pie = function (options) {
        $(this).empty();
        var object = $(this), total = 0, current = 0, create = "<svg viewBox='0 0 132 132'><g>";
        for (var i in options)
            total += options[i];
        for (var item in options) {
            var angleSize = options[item] / total * 360;
            var rounded = new Number(100 * options[item] / total).toPrecision(3);
            create += `<circle tabindex='0' stroke-dashoffset='${360 - angleSize}' style='transform: rotate(${current}deg);'/>
                       <text x='63' y='63'>${options[item]} ${item} </text>
                       <text x='63' y='78'>(~${rounded}%)</text>`;
            current += angleSize;
        }
        create += "</g></svg>";
        $(this).append($(create));
    };
})(jQuery);
function set(info) {
    $("#assessmentMajestic").attr("data-value", info["TrustFlow"] || "Error");
   
    $("#assessmentCitations").attr("data-value", info["CitationFlow"] || "Error");
    $("#topic").text(info["Topic"] || "Unknown");
    $("#betteridge").attr('class', info["Betteridge"] ? "legal" : "");
    $("#subjectivity").attr("data-value", info["Subjectivity"] || "Error");
    $("#polarity").attr("data-value", info["Polarity"] || "Error");

    info['CVC'] = 100 - (info["Subjectivity"] || 0) * 50 - (Math.abs(info["Polarity"]) || 0) * 25;
    if (!info['Betteridge']) info['CVC'] /= 4;
    $("#assessmentContent").attr("data-value", info["CVC"] || "Error");

    var values = [info['CitationFlow'], info['TrustFlow'], info['CVC'], 100 * info['VotesFor'] / (info['VotesFor'] + info['VotesAgainst'])];
    info["Grade"] = count = 0;
    for (var i in values)
        if (values[i]) {
            info["Grade"] += values[i];
            count++;
        }
    info["Grade"] /= count;
    
    $("#percentage").text(new Number(info["Grade"]).toPrecision(3) + "%");
    switch (Math.floor(info["Grade"] / 15)) {
        case 0: $("#grade").text('U'); break;
        case 1: $("#grade").text('F'); break;
        case 2: $("#grade").text('E'); break;
        case 3: $("#grade").text('D'); break;
        case 4: $("#grade").text('C'); break;
        case 5: $("#grade").text('B'); break;
        default: $("#grade").text('A'); break;
    }

    $("#assessmentPeople").pie(info["VotesAgainst"] ? { "No": info["VotesAgainst"], "Yes": info["VotesFor"] } : { "Votes": 0 });
    $("#grammar").pie(info.Grammar || { "Error": 1 });
    $(".circle").each(function (index) { $(this).circle(); });
    $(".bar").each(function (index) { $(this).bar(); });   

    console.log(info);
}
$(function () {
    function rand() { return Math.floor(Math.random() * 100); }
    set({
        TrustFlow: rand(),
        VotesFor:  rand(),
        VotesAgainst:  rand(),
        CitationFlow:  rand(),
        Betteridge: Math.random() > 0.5,
        Subjectivity: Math.random(),
        Polarity: Math.random() * 2 - 1,
        Grammar: { "Verbs":  rand(), "Nouns":  rand(), "Adjectives":  rand(), "Adverbs":  rand(), "Other":  rand() }
    });
    
    $("#searchBar").submit(function (e) {
        $("#searchBar input[type=submit]").attr("disabled", "disabled"); 
        $.ajax({
            type: "GET",
            url: "/stats",
            data: $("#searchBar").serialize(),
            success: function (info) {
                set(info);
                $("#searchBar input[type=submit]").removeAttr("disabled"); 
                $("#vote input[type=submit]").removeAttr("disabled"); 
            }
        });
        e.preventDefault();
    });

    $("#vote").submit(function (e) {
        $.ajax({
            type: "GET",
            url: "/vote",
            data: $("#searchBar").serialize() + "&" + $("#vote").serialize(),
            success: function (info) {
                $("#assessmentPeople").pie({ "No": info["n"], "Yes": info["y"] } || { "Error": 1 });
                $("#vote input[type=submit]").attr("disabled", "disabled");
            }
        });
        e.preventDefault();
    });
});