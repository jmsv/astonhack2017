$(".page").hide();
$(".animate").circliful();
var busy = false;
$(document).ready(function(){
	$('#circles a').click(function(){
		if(busy == false){
			busy = true;
			$('#circles').animate({ marginLeft: "100%", easing: "swing"} , 1000);
			$('.page').animate({ marginLeft: "0%", easing: "swing"} , 1000, function(){busy = false;});
			$(".animate").empty().circliful();
			
		}
	});
	
	$('#assessmentContent + a').click(function(){$('#content').show()});
	$('#assessmentMajestic + a').click(function(){$('#majestic').show()});
	$('#assessmentPeople + a').click(function(){$('#people').show()});
	
	$('.page a').click(function(){
		if(busy == false){
			busy = true;
			$('#circles').animate({ marginLeft: "0%", easing: "swing"} , 1000);
			$('.page').animate({ marginLeft: "-100%", easing: "swing"} , 1000,  function(){$(".page").hide();busy = false;});
			$(".animate").empty().circliful();
		}
	});
});
function hslToRgb(h, s, l){
    var r, g, b;
    if(s == 0){
        r = g = b = l;
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}
function numberToColorHsl(i) {
    var hue = i * 1.2 / 360;
    var rgb = hslToRgb(hue, 1, .5);
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'; 
}