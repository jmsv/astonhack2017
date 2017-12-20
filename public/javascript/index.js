(function ($) {
    $.fn.bar = function (options) {
        var object = $(this);
        var fill = object.find('.fill');
        var tip = object.find('.tip');
        var percentage = object.attr('data-value') + "%";
        fill.css("width", percentage);
        tip.css("left", percentage);
        tip.text(percentage);
    };
    $.fn.circle = function (options) {
        var object = $(this);
        var fill = object.find('circle:nth-of-type(2)');
        var tip = object.find('text');
        var percentage = 360 - object.attr('data-value') / 100 * 360;
        fill.css("stroke-dashoffset", percentage);
        tip.text(object.attr('data-value') + "%");
    };
    $.fn.pie = function (options) {
        $(this).empty();
        var object = $(this), total = 0, current = 0, create = "<svg viewBox='0 0 132 132'><g>";
        for (var item in options)
            total += options[item];
        for (var item in options) {
            var angleSize = options[item] / total * 360;
            var rounded = Math.floor(options[item] / total * 100);
            create += `<circle tabindex='0' stroke-dashoffset='${360 - angleSize}' style='transform: rotate(${current}deg);'/><text x='63' y='63'>${options[item]} ${item} </text><text x='63' y='73'>(~${rounded}%)</text>`;
            current += angleSize;
        }
        create += "</g></svg>";
        $(this).append($(create));
    };
})(jQuery);
$(function () {
    $("#betteridge").attr('class', Math.random() * 100 > 50 ? "legal" : "");
    $(".circle, .bar").each(function (index) { $(this).attr("data-value", Math.floor(Math.random() * 100)); });
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
                $("#assessmentMajestic").attr("data-value", info.TrustFlow || -1);
                $("#assessmentPeople").attr("data-value", Math.floor(info.VotesFor / (info.VotesFor + info.VotesAgainst) * 100) || -1);
                $("#assessmentCitations").attr("data-value", info.CitationFlow || -1);
                ;
                $("#topic").text(info.Topic || "Unknown");
                $("#betteridge").attr('class', info.Betteridge ? "legal" : "");
                $("#assessmentContent").attr("data-value", info.CVC || -1);
                $("#subjectivity").attr("data-value", info.Subjectivity || -1);
                $("#polarity").attr("data-value", info.Polarity || -1);

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