function setMatchmakingSection(section){
	
	let totalContainer = document.getElementById("totalContainer");
	let allContainers = totalContainer.querySelectorAll(".container");
	allContainers.forEach(function(element) {
		element.style.display = "none";
	}, this);
	
	var container;
	
	switch(section) {
		default: // Default is section 0 (return to matchmaking selection page)
		case 0: 
			container = document.getElementById("matchmakingPageContainer");
			break;
		case 1:
			container = document.getElementById("friendlySelection");
			break;
		case 2:
			container = document.getElementById("waitingSelection");
			break;
	}
	container.style.display = "block";
}

