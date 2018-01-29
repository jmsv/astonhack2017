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
    $(".horizontal").each(function (index) { $(this).horizontal(); });   

    console.log(info);
}
$(function () {
    function rand() { return Math.floor(Math.random() * 100); }
    info = {
        TrustFlow: rand(),
        VotesFor:  rand(),
        VotesAgainst:  rand(),
        CitationFlow:  rand(),
        Betteridge: Math.random() > 0.5,
        Subjectivity: Math.random(),
        Polarity: Math.random() * 2 - 1,
        WordCountCoeff: Math.floor(Math.random() * 25),
        Grammar: { "Verbs":  rand(), "Nouns":  rand(), "Adjectives":  rand(), "Adverbs":  rand(), "Other":  rand() }
    };
    set();
    
    $("#searchBar").submit(function (e) {
        $("#searchBar input[type=submit]").attr("disabled", "disabled"); 
        $.ajax({
            type: "GET",
            url: "/stats",
            data: $("#searchBar").serialize(),
            success: function (data) {
                info = data;
                set();
                $("#searchBar input[type=submit]").removeAttr("disabled"); 
                $("#vote input[type=submit]").removeAttr("disabled"); 
                $('#vote')[0].reset();
            }
        });
        e.preventDefault();
    });

    $("#vote").submit(function (e) {
        $.ajax({
            type: "GET",
            url: "/vote",
            data: $("#searchBar").serialize() + "&" + $("#vote").serialize(),
            success: function (votes) {
                info["VotesFor"] = votes["y"];
                info["VotesAgainst"] = votes["n"];
                set();
                $("#vote input[type=submit]").attr("disabled", "disabled");
            }
        });
        e.preventDefault();
    });
});