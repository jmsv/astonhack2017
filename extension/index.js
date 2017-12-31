var info = {};
function set() {
    $("#assessmentMajestic").attr("data-value", info["TrustFlow"] || "Error");
   
    $("#assessmentCitations").attr("data-value", info["CitationFlow"] || "Error");
    $("#topic").text(info["Topic"] || "Unknown");
    $("#betteridge").attr('class', info["Betteridge"] ? "legal" : "");
    $("#subjectivity").attr("data-value", info["Subjectivity"] || "Error");
    $("#polarity").attr("data-value", info["Polarity"] || "Error");

    info['CVC'] = 75 - 50 * (info["Subjectivity"] || 0) - 25 * (Math.abs(info["Polarity"]) || 0) + (info["WordCountCoeff"] || 0);
    if (!info['Betteridge']) info['CVC'] /= 2;
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

    if (info["VotesAgainst"] || info["VotesFor"]) 
		$("#assessmentPeople").pie({ "No": info["VotesAgainst"], "Yes": info["VotesFor"] });
    else $("#assessmentPeople").pie({ "No Votes": 1 });

    $("#grammar").pie(info.Grammar || { "Error": 1 });
    $(".circle").each(function (index) { $(this).circle(); });
    $(".bar").each(function (index) { $(this).bar(); });   

    console.log(info);
}

function show(id) {
    var object = $('#' + id); $('#move').css("left", "-" + object.css("left")); $('#move').css("top", "-" + object.css("top")); $('#' + id + " .animate").each(function () {
        if ($(this).is(':empty'))
            if ($(this).is("#assessmentPeople"))
                $(this).circliful({ animation: 1, animationStep: 5, backgroundColor: "#FF0000", foregroundColor: "#00DD00" }); else $(this).circliful({ animation: 1, animationStep: 5, multiPercentage: 0, progressColor: { 0: '#FF0000', 50: '#FFA500', 90: '#00DD00' } })
    }); $('#' + id + ' .bar').each(function () { $(this).bar() })
}
$(document).ready(function () {
    if (chrome.tabs){
		$('a').click(function () { show($(this).attr("data-show")) });
        chrome.tabs.query({ active: !0, currentWindow: !0 }, function callback(tabs) {
			$.ajax({
				type: "GET",
				url: "http://www.jonmarsh.tech:8082/stats",
				data: {"url": encodeURIComponent(tabs[0].url)},
				success: function (data) {
					info = data;
					set();
					$("#loading").hide();
				},
				fail: function (jqXHR, textStatus, errorThrown) { 
					$("#error").show();
				}
			});
        });
		$("#vote").submit(function (e) {
			$.ajax({
				type: "GET",
				url: "http://www.jonmarsh.tech:8082/vote",
				data: $("#searchBar").serialize() + "&" + $("#vote").serialize(),
				success: function (votes) {
					info["VotesFor"] = votes["y"];
					info["VotesAgainst"] = votes["n"];
					set();
					$("#vote input[type=submit]").attr("disabled", "disabled");
				},
				fail: function (jqXHR, textStatus, errorThrown) { 
					$("#error").show();
				}
			});
			e.preventDefault();
		});
	}
})