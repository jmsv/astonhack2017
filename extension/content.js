chrome.runtime.onMessage.addListener(function (request, sender, response) {
	if (request.message === "giveURL") {
		var firstHref = $("a[href^='http']").eq(0).attr("href");
		$.getJSON("http://faktnews/", {
				url: firstHref
			}, function (data) {
				console.log(data);
			})
			.done(function (data, textStatus, jqXHR) {
				console.log("second success");
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				console.log("error");
			});
	}
});