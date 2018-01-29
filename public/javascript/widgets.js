(function ($) {
	$.fn.random = function (options) {
		var max = new Number($(this).attr("data-max") || 100),
			min = new Number($(this).attr("data-min") || 0),
			value = Math.random() * (max-min) + min;
			console.log(value);
		$(this).attr("data-value", value);
	};
    $.fn.horizontal = function (options) {
        $(this).empty().append($('<span class="tip"></span><span class="fill"></span>'));
        var fill = $(this).find('.fill'),
            tip = $(this).find('.tip');
        if (!isNaN($(this).attr('data-value'))) {
			if(!$(this).attr("data-max"))$(this).attr("data-max",100);
			if(!$(this).attr("data-min"))$(this).attr("data-min",0);
            var value = new Number($(this).attr('data-value')).toPrecision(3),
                max = $(this).attr("data-max"),
                min = $(this).attr("data-min"),
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
	$.fn.vertical = function (options) {
        $(this).empty().append($('<span class="tip"></span><span class="fill"></span>'));
        var fill = $(this).find('.fill'),
            tip = $(this).find('.tip');
        if (!isNaN($(this).attr('data-value'))) {
			if(!$(this).attr("data-max"))$(this).attr("data-max",100);
			if(!$(this).attr("data-min"))$(this).attr("data-min",0);
            var value = new Number($(this).attr('data-value')).toPrecision(3),
                max = $(this).attr("data-max"),
                min = $(this).attr("data-min"),
                origin = 100 * (new Number($(this).attr("data-origin")) - min || -min) / (max - min),
                height = Math.abs(100 * value / (max - min));
            tip.text(value);
            fill.css({ "bottom": origin + "%" }).animate({ "height": height + "%", "bottom": (value < 0 ? origin - height : origin) + "%" }, 1000);
            tip.css({ "bottom": origin + "%" }).animate({ "bottom": (value < 0 ? origin - height : origin + height) + "%" }, 1000);
        } else {
            fill.css("height", 0);
            tip.css("bottom", "50%");
            tip.text("Error");             
        }
    };
    $.fn.circle = function (options) {
        var circle = `
            <svg viewBox="0 0 112 112">
                <g>
                    <circle cx="50%" cy="50%" r="50" />
                    <circle cx="50%" cy="50%" r="50" />
                    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"></text>
                </g>
            </svg>`;
        $(this).empty().append($(circle));
        var fill = $(this).find('circle:nth-of-type(2)'),
            tip = $(this).find('text');
        if ($(this).attr('data-value') !== "Error") {
            var degrees = 2 * 50 * Math.PI,
                value = new Number($(this).attr('data-value')).toPrecision(3),
                max = new Number($(this).attr("data-max") || 100),
                min = new Number($(this).attr("data-min") || 0),
                percentage = value / (max - min);

            fill.css("stroke-dasharray", degrees);
            fill.animate({ "stroke-dashoffset": degrees * (1 - percentage) }, 1000);
            tip.text(value + "%");
            fill.css("animation-iteration-count", percentage);
            fill.css("animation-play-state", "running");
        } else {
            fill.css("stroke-dashoffset", degrees);
            tip.text("Error");
        }
    };
    $.fn.pie = function (options) {
        $(this).empty();
        var object = $(this), total = 0, current = 0, create = "<svg viewBox='0 0 114 114'><g>";
        for (var i in options)
            total += options[i];
        for (var item in options) {
            var degrees = 2 * 50 * Math.PI, angleSize = degrees * options[item] / total;
            var rounded = new Number(100 * options[item] / total).toPrecision(3);
            create += `<circle cx="50%" cy="50%" r="50" tabindex='0' stroke-dasharray='${degrees}' stroke-dashoffset='${degrees - angleSize}' style='transform: rotate(${current*360}deg);'/>
                       <text x='50%' y='50%' text-anchor="middle" dominant-baseline="central">${options[item]} ${item} </text>
                       <text x='50%' y='50%' text-anchor="middle" dominant-baseline="central" dy="16">(~${rounded}%)</text>`;
            current += angleSize/degrees;
        }
        create += "</g></svg>";
        $(this).append($(create));
    };
})(jQuery);