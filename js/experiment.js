var group, counter;
var time = 300;
var gotoExperimentNext = false;
$(document).ready(function(){
	console.log("latest 1");
	$.get("http://www.random.org/integers/?num=1&min=1&max=3&col=1&base=10&format=plain&rnd=new", function(data){
		group = parseInt(data);
		$("#group").text(group);
		$(".next").show();
		switch(group) {
				case 1: //notes
				$("iframe").attr("src","http://ericrav.github.io/Dijkstra-Interactive/notes.pdf");
				break;
				case 2: //video
				$("iframe").attr("src","");
				break;
				case 3: //interactive
				$("iframe").attr("src","http://ericrav.github.io/Dijkstra-Interactive/");
				break;
			}
	});

	$("button.next").click(function(){
		if (!gotoExperimentNext) {
			$("#instructions").hide();
			gotoExperimentNext = true;
			switch(group) {
				case 1:
				$("#notes-instructions").show();
				break;
				case 2:
				$("#video-instructions").show();
				break;
				case 3:
				$("#interactive-instructions").show();
				break;
			}
		} else {
			$(".condition-instructions").hide();
			$("button").hide();
			$("iframe").show();
			$("#timer").show();
			if (group==2) $("iframe").attr("src","http://ericrav.github.io/Dijkstra-Interactive/DijkstrasAlgorithm.mp4");
			timer();
			counter = setInterval(timer,1000);
		}

	});
});
function endExperiment() {
	clearInterval(counter);
	$("iframe").hide();
	$("#timer").hide();
	$("#end-message").show();
	if (group==2) $("iframe").attr("src","");
}
function timer() {
	var minutes = Math.floor(time/60);
	var seconds = time%60;
	if (seconds < 10) seconds = "0" + seconds;
	$("#timer").text(minutes+":"+seconds);
	time--;
	if (time==0) {
		endExperiment();
	}
}