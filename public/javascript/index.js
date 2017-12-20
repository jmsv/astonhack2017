(function ($) {
    $.fn.bar = function (options) {
        var fill = $(this).find('.fill'),
            tip = $(this).find('.tip');
        if ($(this).attr('data-value') !== "Error") {
            var value = new Number($(this).attr('data-value')).toPrecision(2),
                max = new Number($(this).attr("data-max") || 100),
                min = new Number($(this).attr("data-min") || 0),
                percentage = 100 * (value - min) / (max - min) + "%";
            fill.css("width", percentage);
            tip.css("left", percentage);
            tip.text(value);
        } else {
            fill.css("width", 0);
            tip.css("left", "50%");
            tip.text("Error");             
        }
    };
    $.fn.circle = function (options) {
        var fill = $(this).find('circle:nth-of-type(2)'),
            tip = $(this).find('text');
        if ($(this).attr('data-value') !== "Error") {
            var value = new Number($(this).attr('data-value')).toPrecision(2),
                max = new Number($(this).attr("data-max") || 100),
                min = new Number($(this).attr("data-min") || 0),
                percentage = 360 - 360 * value / (max - min);
            fill.css("stroke-dashoffset", percentage);
            tip.text(value + "%");
        } else {
            fill.css("stroke-dashoffset", 360);
            tip.text("Error");
        }
    };
    $.fn.pie = function (options) {
        $(this).empty();
        var object = $(this), total = 0, current = 0, create = "<svg viewBox='0 0 132 132'><g>";
        for (var item in options)
            total += options[item];
        for (var item in options) {
            var angleSize = options[item] / total * 360;
            var rounded = new Number(100 * options[item] / total).toPrecision(2);
            create += `<circle tabindex='0' stroke-dashoffset='${360 - angleSize}' style='transform: rotate(${current}deg);'/>
                       <text x='63' y='63'>${options[item]} ${item} </text>
                       <text x='63' y='73'>(~${rounded}%)</text>`;
            current += angleSize;
        }
        create += "</g></svg>";
        $(this).append($(create));
    };
})(jQuery);
$(function () {
    $("#betteridge").attr('class', Math.random()> 0.5 ? "legal" : "");
    $(".circle, .bar").each(function (index) {
        var max = new Number($(this).attr("data-max") || 100),
            min = new Number($(this).attr("data-min") || 0);
        $(this).attr("data-value", Math.random() * (max - min) + min);
    });
    $("#grammar").pie({ "Verbs": Math.floor(Math.random() * 100), "Nouns": Math.floor(Math.random() * 100), "Adjectives": Math.floor(Math.random() * 100), "Adverbs": Math.floor(Math.random() * 100), "Other": Math.floor(Math.random() * 100) });
    $(".circle").each(function (index) { $(this).circle(); });
    $(".bar").each(function (index) { $(this).bar(); });

    $("#searchBar").submit(function (e) {
        $.ajax({
            type: "GET",
            url: "/stats",
            data: $("#searchBar").serialize(),
            success: function (info) {
                console.log(info);
                $("#assessmentMajestic").attr("data-value", info.TrustFlow || "Error");
                $("#assessmentPeople").attr("data-value", (info.VotesFor / (info.VotesFor + info.VotesAgainst) * 100) || "Error");
                $("#assessmentCitations").attr("data-value", info.CitationFlow || "Error");
                $("#topic").text(info.Topic || "Unknown");
                $("#betteridge").attr('class', info.Betteridge ? "legal" : "");
                $("#assessmentContent").attr("data-value", info.CVC || "Error");
                $("#subjectivity").attr("data-value", info.Subjectivity || "Error");
                $("#polarity").attr("data-value", info.Polarity || "Error");

                var values = [info['CitationFlow'], info['TrustFlow'], info['CVC'], info['Votes']];
                var grade = 0;
                for (var i in values) grade += values[i];
                grade /= values.length;
                switch (Math.floor(grade/ 15)) {
                    case 0: $("#grade").text('U'); break;
                    case 1: $("#grade").text('F'); break;
                    case 2: $("#grade").text('E'); break;
                    case 3: $("#grade").text('D'); break;
                    case 4: $("#grade").text('C'); break;
                    case 5: $("#grade").text('B'); break;
                    default: $("#grade").text('A'); break;
                }

                $("#grammar").pie(info.Grammar || {"Error":1});
                $(".circle").each(function (index) { $(this).circle(); });
                $(".bar").each(function (index) { $(this).bar(); });

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
                console.log(info);
                $("#vote input[type=submit]").attr("disabled", "disabled");
            }
        });
        e.preventDefault();
    });
});