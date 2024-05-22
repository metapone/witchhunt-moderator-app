TIMER_VERY_SHORT = 8;
TIMER_SHORT = 15;
TIMER_MEDIUM = 30;
TIMER_LONG = 360;

var STEP_dict = {"Deal":		["deal"],
				 "Game Start":  ["townSleepInstructions", "peepingTom", "survivalist", "acolyte", "witchMeet", "fortuneTeller", "apprentice", "gambler", "oracle", "initBomber"],
				 "Day":			["dayStart", "victoryCheckA", "lynch", "victoryCheckB", "bombPassCheck"],
				 "Night":		["nightStart", "angelTutorial", "gravediggerMultiplex", "demons1", "demons2", "angels", "angelConclusion", "witchMultiplex", "priest", "inquisitor", "hunterCheck", "bomberCheck", "watchmanCheck", "witchHandicapCheck", "resolveNightKills"],
				 "Village Win":	["villageWin"],
				 "Witch Win":	["witchWin"],
				 }

// helpers

function pn(playerID) {
	return "<span class='player-name-highlight'>" + g.playerList[playerID].name + "</span>";
}

var ASCII_UPPERCASE_INDEX = 65;
var ASCII_LOWERCASE_INDEX = 97;


function logPlayer(playerID, uppercase) {
	var p = g.playerList[playerID];
	var myRoleNum = p.role;
	if (p.choice == 1) {
		myRoleNum += 15;
	}
	if (uppercase) {
		g.log += String.fromCharCode(ASCII_UPPERCASE_INDEX + myRoleNum);
	} else {
		g.log += String.fromCharCode(ASCII_LOWERCASE_INDEX + myRoleNum);
	}
}

function logRole(roleID, uppercase) {
	if (uppercase) {
		g.log += String.fromCharCode(ASCII_UPPERCASE_INDEX + roleID);
	} else {
		g.log += String.fromCharCode(ASCII_LOWERCASE_INDEX + roleID);
	}
}

//deal phase steps

function STEP_deal() { //dummy
}
STEP_deal.prompt_type = "deal";
STEP_deal.prompt_subject = "<img src='img/witchhunt_logo.png'>";


//game start phase steps

function STEP_survivalist() {
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 4) {
			g.playerList[i].extraLives += 1;
			break;
		}
	}
}
STEP_survivalist.role_requirement = 4;
STEP_survivalist.role_link = 4;
STEP_survivalist.prompt_type = "auto";

function STEP_townSleepInstructions() {
	var hasPT = false;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 11) {
			hasPT = true;
			break;
		}
	}
	var myMessage = "";
	myMessage += "<br><p class='modVoice'>Now that everyone has seen their cards, we are about to begin the game.</p>";
	myMessage += "<br><p class='modVoice'>At the start of the game and each night, I'll ask that everyone go to sleep.</p>";
	myMessage += "<br><p class='modVoice'>When this happens, I will need everyone to close their eyes, put their heads down, make no noise, and not communicate in any way.</p>";
	myMessage += "<br><p class='modVoice'>If I ask you to wake up and communicate something to me, please do it silently.</p>";
	if (!hasPT) {
		myMessage += "<br><p class='modVoice'>Now town, please go to sleep and we will start the game.</p>";
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_townSleepInstructions.prompt_type = "info";
STEP_townSleepInstructions.prompt_subject = "WitchHunt";

function STEP_peepingTom() {
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 11) {
			g.peepingTomAvailable = i;
			break;
		}
	}
	var hasAcolyte = false;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 16) {
			hasAcolyte = true;
			break;
		}
	}
	var myMessage = "";
	myMessage += "<p class='modVoice'>Before we go to sleep, I'm going to quickly remind you of the Peeping Tom.</p>";
	myMessage += "<p class='modVoice'>The Peeping Tom is a wild card--they can wake up with <i>any</i> other normal character once.</p><br>";
	myMessage += "<p class='modVoice'>For example, if I asked for the Judge to wake up, the Peeping Tom could wake up too; both players would see each other, and the Judge would make their usual decision while the Peeping Tom watches.</p><br>";
	if (hasAcolyte) {
		myMessage += "<p class='modVoice'><i>(However, the Peeping Tom cannot spy on dead players, the Witch Coven, the Priest, or Acolyte.)</i></p><br>";
	} else {
		myMessage += "<p class='modVoice'><i>(However, the Peeping Tom cannot spy on dead players, the Witch Coven, or the Priest.)</i></p><br>";
	}
	myMessage += "<p class='modVoice'>If the person the Peeping Tom tries to watch is already dead, the Peeping Tom still sees any special information and is allowed to make any decisions in their place.</p><br>";
	myMessage += "<br><p class='modVoice'>But remember, the Peeping Tom can only do this once <b>the entire game</b>.</p>";
	myMessage += "<br><p class='modVoice'>Now town, please go to sleep and we will start the game.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_peepingTom.role_requirement = 11;
STEP_peepingTom.prompt_type = "info";
STEP_peepingTom.prompt_subject = "Peeping Tom";

function STEP_acolyte() {
	var priestID;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 0) {
			priestID = i;
			break;
		}
	}
	var myMessage = "";
	myMessage += "<p class='modVoice'>Priest, please raise your hand.</p>";
	myMessage += "<p class='modVoice'>Now the Acolyte knows who you are.</p>";
	myMessage += "<br><p class='modShow'>Point to " + pn(i) + ", the Priest.</p>";
	myMessage += "<br><p class='modVoice'>Thank you Acolyte, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_acolyte.role_requirement = 16;
STEP_acolyte.role_link = 16;
STEP_acolyte.prompt_type = "info";
STEP_acolyte.prompt_subject = null;
STEP_acolyte.timer = TIMER_SHORT;

function STEP_witchMeet() {
	witchRolePairs = [];
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].team == -1) {
			g.playerList[i].covenJoinCycleNum = 0;
			witchRolePairs.push([i,g.playerList[i].role]);
			logPlayer(i,1);
		}
	}
	g.log += "-";

	if (advancedRules) {
		g.illusionKillAvailable = true;
	}

	var myMessage = "";
	myMessage += "<p class='modVoice'>Witches, wake up and see each other.</p>";
	myMessage += "<p class='modVoice'>There should be <b>" + witchRolePairs.length + "</b> of you.</p>";
	myMessage += "<p class='modVoice'>I will now come around and show you your roles.</p></br>";
	for (var i = 0; i < witchRolePairs.length; i++) {
		myMessage += "<p class='modShow'><b>" + pn(witchRolePairs[i][0]);
		myMessage += " is the <span class='rolename'> " + masterRoleDict[witchRolePairs[i][1]] + "</span></p>";
	}
	myMessage += "<br><p class='modVoice'>Thank you Witches, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_witchMeet.team_link = -1;
STEP_witchMeet.prompt_type = "info";
STEP_witchMeet.prompt_subject = "Witches";
STEP_witchMeet.timer = TIMER_MEDIUM;

function STEP_apprentice(choice) {
	var gravediggerID;
	var judgeID;
	var apprenticeID;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 2) {
			gravediggerID = i;
		} else if (g.playerList[i].role == 1) {
			judgeID = i;
		} else if (g.playerList[i].role == 3) {
			apprenticeID = i;
		}
	}
	g.playerList[apprenticeID].choice = choice;
	var myMessage = "";
	myMessage += "<p class='modVoice'>I will now point to the person with the character you selected.</p><br>";
	if (choice == 0) {
		myMessage += "<p class='modShow'>(Point to " + pn(gravediggerID) + ", the <span class='rolename'>Gravedigger</span>.)</p>";
	} else if (choice == 1) {
		myMessage += "<p class='modShow'>(Point to " + pn(judgeID) + ", the <span class='rolename'>Judge</span>.)</p>";
	} else {
		myMessage += "<p class='modSecret'>(The Apprentice refused to choose...)</p>";
	}
	myMessage += "<br><p class='modVoice'>You will automatically take over this person's duties after they die.</p>";
	myMessage += "<p class='modVoice'>Thank you Apprentice, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_apprentice.role_requirement = 3;
STEP_apprentice.role_link = 3;
STEP_apprentice.prompt_type = "choice";
STEP_apprentice.prompt_subject = null;
STEP_apprentice.prompt_choices = ["Gravedigger", "Judge"];
STEP_apprentice.prompt_string = "<p class='modVoice'>Apprentice, would you like to follow the Gravedigger or the Judge?</p>";
STEP_apprentice.prompt_string += "<p class='modSecret'>(Mime digging <u>down</u> versus holding a gavel <u>up</u>.)</p>";
STEP_apprentice.timer = TIMER_SHORT;
STEP_apprentice.allow_PT = true;

function STEP_gambler(choice) {
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 6) {
			g.playerList[i].choice = choice;
		}
	}
	var myMessage = "";
	myMessage += "<p class='modVoice'>Thank you Gambler, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_gambler.role_requirement = 6;
STEP_gambler.role_link = 6;
STEP_gambler.prompt_type = "choice";
STEP_gambler.prompt_subject = null;
STEP_gambler.prompt_choices = ["Even", "Odd"];
STEP_gambler.prompt_string = "<p class='modVoice'>Gambler, would you like to be protected on even or odd nights?</p>";
STEP_gambler.prompt_string += "<p class='modSecret'>(Hold up <u>two</u> fingers versus just <u>one</u>.)</p>";
STEP_gambler.timer = TIMER_SHORT;
STEP_gambler.allow_PT = true;

function STEP_fortuneTeller(target) {
	g.deathLocationDict[target] = g.deathLocationStack.pop();
	var myMessage = "";
	for (var key in g.deathLocationDict) {
		if (key != null) {
			myMessage += "<p class='modShow'>(<span class=''>The " + masterRoleDict[key] + "'s</span>";
			myMessage += " body will be found<br><span class='keyword-highlight'>";
			myMessage += deathLocationStringDict[g.deathLocationDict[key]] + "</span>.)</p>";
		}
	}
	myMessage += "<br><p class='modVoice'>Thank you Fortune Teller, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_fortuneTeller.role_requirement = 21;
STEP_fortuneTeller.role_link = 21;
STEP_fortuneTeller.prompt_type = "role";
STEP_fortuneTeller.prompt_subject = "Fortune Teller";
STEP_fortuneTeller.prompt_string = "<p class='modVoice'>The Fortune Teller can choose any character, and I'll tell them what I will say when the player with that character dies.</p><p class='modVoice'>This will be like a secret signal just between us, but it will only apply if the person dies at night.</p><br><p class='modVoice'>Which character is the Fortune Teller learning about?</p>";
STEP_fortuneTeller.timer = TIMER_SHORT;
STEP_fortuneTeller.allow_PT = true;

function STEP_oracle() {
	var targetID = null;
	while (targetID == null) {
		var testID = Math.floor(Math.random() * g.playerList.length);
		if ((g.playerList[testID].team == 0) && (g.playerList[testID].role != 8)) {
			targetID = testID;
		}
	}
	var myMessage = "";
	myMessage += "<p class='modVoice'>I am going to show the Oracle a random person who is a simple Village Peasant.</p>";
	myMessage += "<p class='modVoice'>This means they can't be a Witch, nor the Priest.  Just a Villager with a normal character.</p><br>";
	myMessage += "<p class='modShow'>(Point to " + pn(targetID) + ".)</p>";
	myMessage += "<br><p class='modVoice'>Thank you Oracle, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_oracle.role_requirement = 8;
STEP_oracle.role_link = 8;
STEP_oracle.prompt_type = "info";
STEP_oracle.prompt_subject = "Oracle";
STEP_oracle.timer = TIMER_SHORT;
STEP_oracle.allow_PT = true;

function STEP_initBomber(target) {
	myMessage = "";
	if (target == 77) {
		myMessage += "<p class='modVoice'>The Bomber has decided we will not have a Bomb this game.</p>";
	} else {
		var p = g.playerList[target];
		g.bombHolder = target;
		if (p.role == 15) {
			myMessage += "<p class='modSecret'>(The Bomber gave themselves the Bomb; they clearly know how to have a good time.)</p>";
		} else {
			myMessage += "<p class='modSecret'>(The Bomber gave the Bomb to " + pn(target) + ".)</p>";
		}
	}
	myMessage += "<p class='modVoice'>Thank you Bomber, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_initBomber.role_requirement = 18;
STEP_initBomber.role_link = 18;
STEP_initBomber.prompt_type = "target";
STEP_initBomber.prompt_subject = "Bomber";
STEP_initBomber.prompt_string = "<p class='modVoice'>Bomber, who would you like to give the Bomb to?</p>";
STEP_initBomber.prompt_string += "<p class='modVoice'>Whoever has the Bomb can pass it (like a hot potato) at the end of each day.</p>";
STEP_initBomber.prompt_string += "<p class='modVoice'>You can detonate it on a night of your choice.</p>";
STEP_initBomber.timer = TIMER_SHORT;
STEP_initBomber.allow_PT = true;

//day phase steps - normal

function STEP_dayStart() {
	//responsible for calling onDeath(playerNum) for each death player
	g.cycleNum += 1;

	var myMessage = "";
	if (g.cycleNum == 1) {
		var hasFortuneTeller = false;
		for (var i = 0; i < g.playerList.length; i++) {
			if (g.playerList[i].role == 21) {
				hasFortuneTeller = true;
				break;
			}
		}
		if (!hasFortuneTeller)
		{
			g.deathLocationStack = [];
		}

		myMessage += "<p class='modVoice'>And with that, the town can wake up!</p>";
		if (g.bombHolder != null) {
			myMessage += "<p class='modVoice'>(Oh, look at that. It seems " + pn(g.bombHolder) + " has the Bomb!)</p>";
		}
		myMessage += "<p class='modVoice'>It is now Day 1!</p>";
		myMessage += "<p class='modVoice'>You can choose to hang a target by majority vote, but remember that the decision always goes to the Judge if you cannot agree.</p>";
		myMessage += "<p class='modVoice'>I will allow you to change your votes freely until the time limit for the day is up, but at that point I will ask you to immediately freeze your votes.</p>";
		myMessage += "<p class='modVoice'>Please vote with both arms as visibly as possible; this will promote discussion and help track down the Witches!</p>";
		myMessage += "<p class='modVoice'><b>Ready?</b></p>";
	} else if (g.nightKillList.length == 0) {
		myMessage += "<p class='modVoice'>Town, wake up.</p>";
		myMessage += "<p class='modVoice'>No one was targeted in the night.</p>";
	} else {
		var fullList = [];
		var attemptsDict = {};
		var survivalDict = {};
		var anySurvival = false;
		if (g.cycleNum > 1) {
			for (var i = 0; i < g.nightKillList.length; i++) {
				if (g.nightKillList[i] in attemptsDict) {
					attemptsDict[g.nightKillList[i]] += 1;
				} else {
					attemptsDict[g.nightKillList[i]] = 1;
					fullList.push(g.nightKillList[i]);
				}
			}
			for (var i = 0; i < g.nightSurvivalList.length; i++) {
				if (g.nightSurvivalList[i] in survivalDict) {
					survivalDict[g.nightSurvivalList[i]] += 1;
				} else {
					survivalDict[g.nightSurvivalList[i]] = 1;
				}
				anySurvival = true;
			}
		}
		var prefixList = ["As if that wasn't enough, tell ", "On top of that, tell ", "Additionally, tell ", "Tell "];
		var prefixLast = "Finally, tell ";
		var prefixLastMinCount = 3;
		var numberStrings = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
		var currentPrefixNum = 0;
		var s;

		shuffle(fullList);

		for (var i = 0; i < fullList.length; i++) {
			localPlayerID = fullList[i];
			s = "";
			if ((currentPrefixNum == (fullList.length - 1)) && (currentPrefixNum >= prefixLastMinCount)) {
				s = prefixLast;
			} else if (prefixList.length) {
				s = prefixList.pop();
			 } else {
				s = "AND, ";
			}
			if (attemptsDict[localPlayerID] > 1) { //multi-kill
				if (survivalDict[localPlayerID] == attemptsDict[localPlayerID]) { //#survival
					s += "a story about how " + pn(localPlayerID);
					s += " survived not just one, but ";
					s += numberStrings[attemptsDict[localPlayerID]];
					s += " attempts on their life.";
				} else if (localPlayerID in survivalDict) {//death; some, but not enough, survivals
					s += "a story about how " + numberStrings[attemptsDict[localPlayerID]];
					s += " attempts were made on " + pn(localPlayerID);
					s += "'s life; they survived the first ";
					s += numberStrings[survivalDict[localPlayerID]];
					s += ", but the ";
					if (attemptsDict[localPlayerID] == 2) {
						s += "other one ";
					} else if (attemptsDict[localPlayerID] - survivalDict[localPlayerID] > 1) {
						s += "rest ";
					} else {
						s += "final one ";
					}
					s += "did them in, leaving the town to find their body <span class='keyword-highlight'>";
					s += getDeathLocationHelper(localPlayerID) + "</span>.";
				} else { //death; straight up overkill
					s += "a story about how the town found " + pn(localPlayerID);
					s += "'s body<span class='keyword-highlight'>";
					s += getDeathLocationHelper(localPlayerID) + "</span>, having been needlessly killed ";
					s += numberStrings[attemptsDict[localPlayerID]];
					s += " different times.";
				}
			} else { //single kill
				if (survivalDict[localPlayerID]) { //survival
					s += "a story about how " + pn(localPlayerID);
					s += " survived an attempt on their life.";
				} else { //death
					s += "a story about how " + pn(localPlayerID);
					s += "'s dead body was found<span class='keyword-highlight'>";
					s += getDeathLocationHelper(localPlayerID) + "</span>.";
				}
			}
			myMessage += "<p class='modStory'>" + s + "</p>";
			currentPrefixNum += 1;
		}
		if (anySurvival && g.hunterNight == null) {
			hunterInGame = false;
			for (var i = 0; i < g.playerList.length; i++) {
				if (g.playerList[i].role == 10) {
					hunterInGame = true;
					break;
				}
			}
			if (hunterInGame) {
				myMessage += "<br><p class='modVoice'>Because this is the first time someone has survived, the Hunter may kill a target tonight.</p>";
			}
		}

		if (g.bombHolder) {
			for (var i = 0; i < g.playerList.length; i++) {
				if (g.playerList[i].role == 18 && g.playerList[i].used == true) {
					g.bombHolder = null;
					myMessage += "<br><p class='modVoice'>The Bomb was detonated, and is no more.</p>";
					break;
				}
			}
		}

		for (var i = 0; i < fullList.length; i++) {
			localPlayerID = fullList[i];
			if (attemptsDict[localPlayerID] > 1) { //multi-kill
				if (survivalDict[localPlayerID] == attemptsDict[localPlayerID]) { //survival
					onSurvival(localPlayerID);
				} else if (localPlayerID in survivalDict) { //death; some, but not enough, survivals
					onDeath(localPlayerID);
				} else { //death; straight up overkill
					onDeath(localPlayerID);
				}
			} else { //single kill
				if (survivalDict[localPlayerID]) { //survival
					onSurvival(localPlayerID);
				} else { //death
					onDeath(localPlayerID);
				}
			}
		}
	}
	$('#infoPrompt').html(myMessage);

	g.angelProtectList = [];
	g.shenanigansTargetList = [];
	g.dilemmaTargetList = [];
	g.nightProtectList = [];
	g.nightKillList = [];
	g.nightSurvivalList = [];
	return 0;
}
STEP_dayStart.prompt_type = "info";
STEP_dayStart.prompt_subject = "Day Start";
STEP_dayStart.timer = TIMER_MEDIUM;

function getDeathLocationHelper(target) {
	var targetRole = g.playerList[target].role;
	//console.log(targetRole, (targetRole in g.deathLocationDict));
	if (g.deathLocationStack.length == 0) {
		return deathLocationStringDict[77];
	} else if (targetRole in g.deathLocationDict) {
		return deathLocationStringDict[g.deathLocationDict[targetRole]];
	} else {
		return deathLocationStringDict[g.deathLocationStack.pop()];
	}
}

function STEP_lynch(target) {
	//responsible for calling onDeath(playerNum) for each death player
	//responsible for adding STEP_judgeMultiplex (no lynch)

	var myMessage = "";
	if (target == 77) {
		myMessage += "<p class='modVoice'>The town has failed to hang anyone.</p>";
		myMessage += "<p class='modVoice'>Town go to sleep, we're going to the Judge!</p>";
		g.stepList.unshift(g.stepList.shift(), "judgeMultiplex");
	} else if (g.playerList[target].role == 15 && g.cycleNum <= 3) { //emissary
		myMessage += "<p class='modVoice'>The town chose to hang " + pn(target);
		myMessage += ", but " + pn(target) + " mysteriously survived!</p>";
		myMessage += "<p class='modSecret'>(" + pn(target) + " is the Emissary.)</p>";
		myMessage += "<p class='modVoice'>The town goes to sleep disappointed.</p>";
		myMessage += onSurvival(target);
	} else if (g.playerList[target].extraLives > 0) {
		g.playerList[target].extraLives -= 1;
		myMessage += "<p class='modVoice'>The town chose to hang " + pn(target);
		myMessage += ", but " + pn(target) + " mysteriously survived!</p>";
		myMessage += "<p class='modSecret'>(" + pn(target) + " had an extra life.)</p>";
		myMessage += "<p class='modVoice'>The town goes to sleep disappointed.</p>";
		myMessage += onSurvival(target);
	} else if (g.playerList[target].role == 0 && g.cycleNum == 1 && villageHandicap) { //priest
		myMessage += "<p class='modVoice'>The town chose to hang " + pn(target);
		myMessage += ", but " + pn(target) + " mysteriously survived!</p>";
		myMessage += "<p class='modSecret'>(" + pn(target) + " is the Priest, and the Village team handicap is in effect.)</p>";
		myMessage += "<p class='modVoice'>The town goes to sleep disappointed.</p>";
		myMessage += onSurvival(target);
	} else {
		myMessage += "<p class='modVoice'>The town chose to hang " + pn(target) + "!</p>";
		myMessage += "<p class='modVoice'>" + pn(target) + " is now dead; town, go to sleep.</p>";
		kill(target);
		onDeath(target);
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_lynch.interrupt_list = ["looseCannon", "nurse", "assassin1", "spiritualist", "modkillChoice"];
STEP_lynch.prompt_type = "target";
STEP_lynch.prompt_subject = "Hanging";
STEP_lynch.prompt_string = "LYNCH"; //override with custom behaviour
STEP_lynch.no_target_string_override = "No Hanging";
STEP_lynch.timer = TIMER_LONG;
STEP_lynch.timer_alt = TIMER_SHORT
// day phase steps - interrupt

function STEP_looseCannon(target) {
	var myID;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 12) {
			myID = i;
			break;
		}
	}
	g.log += "%";
	var myMessage = "";
	var lcDies = true;
	var targetValid = true;
	var targetDies = true;
	if (myID == target) {
		if (g.playerList[myID].extraLives > 1) {
			g.playerList[myID].extraLives -= 2;
			lcDies = false;
			targetDies = false;
			myMessage += "<p class='modVoice'>" + pn(myID) + " the Loose Cannon sacrificed an extra life to hang another extra life.</p>";
			myMessage += "<p class='modVoice'>And yet, is still here.  Everyone has <i>so many questions</i>.</p>";
		} else if (g.playerList[myID].extraLives == 1) {
			lcDies = false;
			myMessage += "<p class='modVoice'>" + pn(myID) + " the Loose Cannon sacrificed an extra life to hang... themselves.</p>";
			myMessage += "<p class='modVoice'>And so " + pn(myID) + " is dead.  Amazing.</p>";
		} else {
			targetValid = false;
			myMessage += "<p class='modVoice'>" + pn(myID) + " the Loose Cannon hanged... themselves.</p>";
			myMessage += "<p class='modVoice'>And so " + pn(myID) + " is dead.</p>";
		}
	} else {
		if (g.playerList[myID].extraLives > 0) {
			g.playerList[myID].extraLives -= 1;
			lcDies = false;
			if (g.playerList[target].extraLives > 0) {
				g.playerList[target].extraLives -= 1;
				myMessage += "<p class='modVoice'>" + pn(myID) + " the Loose Cannon sacrificed an extra life to hang " + pn(target) + ".</p>";
				myMessage += "<p class='modVoice'>Except it turns out, " + pn(target) + " mysteriously survived too!</p>";
				myMessage += "<p class='modSecret'>(" + pn(target) + " had an extra life.)</p>";
				targetDies = false;
			} else if (g.playerList[target].role == 18 && g.cycleNum < 4) { //emissary
				myMessage += "<p class='modVoice'>" + pn(myID) + " the Loose Cannon sacrificed an extra life to hang " + pn(target) + ".</p>";
				myMessage += "<p class='modVoice'>Except it turns out, " + pn(target) + " mysteriously survived too!</p>";
				myMessage += "<p class='modSecret'>(" + pn(target) + " is the Emissary.)</p>";
				targetDies = false;
			} else if (g.playerList[target].role == 0 && g.cycleNum == 1 && villageHandicap) { //priest, handicap
				myMessage += "<p class='modVoice'>" + pn(myID) + " the Loose Cannon sacrificed an extra life to hang " + pn(target) + ".</p>";
				myMessage += "<p class='modVoice'>Except it turns out, " + pn(target) + " mysteriously survived too!</p>";
				myMessage += "<p class='modSecret'>(" + pn(target) + " is the Priest, and the Village team handicap is in effect.)</p>";
				targetDies = false;
			} else {
				myMessage += "<p class='modVoice'>" + pn(myID) + " the Loose Cannon sacrificed an extra life to hang " + pn(target) + ".</p>";
				myMessage += "<p class='modVoice'>This sort of feels like cheating.</p>";
			}
		} else {
			if (g.playerList[target].extraLives > 0) {
				g.playerList[target].extraLives -= 1;
				myMessage += "<p class='modVoice'>" + pn(myID) + " the Loose Cannon sacrificed themselves to hang " + pn(target) + ".</p>";
				myMessage += "<p class='modVoice'>But " + pn(target) + " mysteriously survived.  How embarrassing!</p>";
				myMessage += "<p class='modSecret'>(" + pn(target) + " had an extra life.)</p>";
				targetDies = false;
			} else if (g.playerList[target].role == 18 && g.cycleNum < 4) { //emissary
				myMessage += "<p class='modVoice'>" + pn(myID) + " the Loose Cannon sacrificed themselves to hang " + pn(target) + ".</p>";
				myMessage += "<p class='modVoice'>But " + pn(target) + " mysteriously survived.  How embarrassing!</p>";
				myMessage += "<p class='modSecret'>(" + pn(target) + " is the Emissary.)</p>";
				targetDies = false;
			} else if (g.playerList[target].role == 0 && g.cycleNum == 1 && villageHandicap) { //priest, handicap
				myMessage += "<p class='modVoice'>" + pn(myID) + " the Loose Cannon sacrificed themselves to hang " + pn(target) + ".</p>";
				myMessage += "<p class='modVoice'>But " + pn(target) + " mysteriously survived.  How embarrassing!</p>";
				myMessage += "<p class='modSecret'>(" + pn(target) + " is the Priest, and the Village team handicap is in effect.)</p>";
				targetDies = false;
			} else {
				myMessage += "<p class='modVoice'>" + pn(myID) + " the Loose Cannon sacrificed themselves to hang " + pn(target) + ".</p>";
			}
		}
	}
	if (lcDies) {
		kill(myID);
		onDeath(myID);
	} else {
		myMessage += onSurvival(myID);
	}
	if (targetValid) {
		if (targetDies) {
			kill(target);
			onDeath(target);
		} else {
			myMessage += onSurvival(target);
		}
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_looseCannon.interrupt = true;
STEP_looseCannon.role_requirement = 12;
STEP_looseCannon.role_link = 12;
STEP_looseCannon.prompt_type = "target";
STEP_looseCannon.prompt_subject = null;
STEP_looseCannon.prompt_string = "<p class='modVoice'>Who is the Loose Cannon hanging?</p>";
STEP_looseCannon.no_target_invalid = true;
STEP_looseCannon.timer = TIMER_SHORT;

function STEP_nurse(target) {
	var myID;
	var targetID;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 13) {
			myID = i;
		}
		if (g.playerList[i].role == target) {
			targetID = i;
		}
	}
	var p = g.playerList[targetID];
	var myMessage = "";
	if (p.team == 1) {
		myMessage += "<p class='modVoice'>The Nurse cannot give extra lives to holy characters.</p>";
	} else {
		g.log += "z+";
		logPlayer(targetID, 0);
		if (target == 13) { //self target
			p.extraLives += 1;
			myMessage += "<p class='modVoice'>" + pn(myID) + " the Nurse gave themselves an extra life.</p>";
		} else {
			myMessage += "<p class='modVoice'>" + pn(myID) + " the Nurse gave the " + masterRoleDict[target] + " an extra life, assuming that the " + masterRoleDict[target] + " is still alive.</p>";
			if (p.deathCycleNum == null) {
				p.extraLives += 1;
			}
		}
		g.playerList[myID].used = true;
	}
	g.stepList.unshift(g.stepList.shift(), "lynch"); //go back to lynch
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_nurse.interrupt = true;
STEP_nurse.role_requirement = 13;
STEP_nurse.role_link = 13;
STEP_nurse.prompt_type = "role";
STEP_nurse.prompt_subject = null;
STEP_nurse.prompt_string = "<p class='modVoice'>Which character is the Nurse giving an extra life?</p>";
STEP_nurse.no_target_invalid = true;
STEP_nurse.timer = TIMER_SHORT;

function STEP_assassin1(target) {
	//responsible for assigning to g.tempTarget and adding STEP_assassin2
	g.tempTarget = target;
	g.stepList.unshift(g.stepList.shift(), "assassin2");
	return 0;
}
STEP_assassin1.interrupt = true;
STEP_assassin1.role_requirement = 19;
STEP_assassin1.role_link = 19;
STEP_assassin1.prompt_type = "target-auto";
STEP_assassin1.prompt_subject = null;
STEP_assassin1.prompt_string = "<p class='modVoice'>Who is the Assassin trying to kill?</p>";
STEP_assassin1.no_target_invalid = true;
STEP_assassin1.timer = TIMER_SHORT;

function STEP_assassin2(target) {
	var myID;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 19) {
			myID = i;
			break;
		}
	}
	g.log += "Z";
	var assassinDie = true;
	var myMessage = "";
	if (g.tempTarget == myID) {
		if (g.playerList[g.tempTarget].role == target) {
			myMessage += "<p class='modVoice'>" + pn(myID) + " the Assassin successfully guessed their own role and killed themselves.</p>";
		} else {
			myMessage += "<p class='modVoice'>" + pn(myID) + " the Assassin failed to guess <i>their own role</i> and killed themselves.  Not that it mattered.</p>";
		}
	} else {
		if (g.playerList[g.tempTarget].role == target) {
			myMessage += "<p class='modVoice'>" + pn(myID) + " the Assassin successfully guessed that ";
			myMessage += pn(g.tempTarget) + " was the " + masterRoleDict[target] + ", killing them.</p>";
			if (target == 15 && g.cycleNum <= 3) {
				myMessage += "<p class='modSecret'>(" + pn(g.tempTarget) + " may have been the Emissary, but the Emissary card doesn't say anything about assassins...)</p>";
			}
			assassinDie = false;
		} else {
			myMessage += "<p class='modVoice'>" + pn(myID) + " the Assassin incorrectly guessed that ";
			myMessage += pn(g.tempTarget) + " was the " + masterRoleDict[target] + ", resulting in " + pn(myID) + " killing themselves in shame.</p>";
			myMessage += "<p class='modSecret'>(" + pn(g.tempTarget) + " is actually the the " + masterRoleDict[g.playerList[g.tempTarget].role] + ".)</p>";
		}
	}
	var someDeath = true;
	if (assassinDie) {
		if (g.playerList[myID].extraLives > 0) {
			myMessage += "<p class='modVoice'>However, " + pn(myID) + " survived with an extra life nonetheless.</p>";
			someDeath = false;
		} else {
			kill(myID);
		}
	} else {
		if (target == 0 && g.cycleNum == 1 && villageHandicap) {
			myMessage += "<p class='modVoice'>However, " + pn(g.tempTarget) + " survived thanks to the Village team handicap. (So maybe not the best choice.)</p>";
			someDeath = false;
		}
		else if (g.playerList[g.tempTarget].extraLives > 0) {
			myMessage += "<p class='modVoice'>However, " + pn(g.tempTarget) + " survived with an extra life nonetheless.</p>";
			someDeath = false;
		} else {
			kill(g.tempTarget);
		}
	}
	g.playerList[myID].used = true;

	if (someDeath) {
		g.stepList.unshift(g.stepList.shift(), "victoryCheckA", "lynch"); //go back to lynch after victorCheck
	} else {
		g.stepList.unshift(g.stepList.shift(), "lynch"); //go back to lynch
	}

	//do this AFTER the normal step insert above!
	if (assassinDie) {
		if (g.playerList[myID].extraLives > 0) {
			onSurvival(myID);
		} else {
			onDeath(myID);
		}
	} else {
		if (g.playerList[g.tempTarget].extraLives > 0) {
			onSurvival(g.tempTarget);
		} else {
			onDeath(g.tempTarget);
		}
	}

	g.tempTarget = null;
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_assassin2.interrupt = true;
STEP_assassin2.role_link = 19;
STEP_assassin2.prompt_type = "role";
STEP_assassin2.prompt_subject = null;
STEP_assassin2.prompt_string = "<p class='modVoice'>What character does the Assassin guess?</p>";
STEP_assassin2.no_target_invalid = true;
STEP_assassin2.timer = TIMER_SHORT;

function STEP_spiritualist(target) {
	var myID;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 20) {
			myID = i;
			break;
		}
	}

	var myMessage = "";
	myMessage += "<p class='modVoice' style='color:#363636;'>I will now privately show " + pn(myID) + " the Spiritualist both of " + pn(target) + "'s cards.</p>";
	myMessage += "<p class='modShow'><span class=''>" + pn(target) + " was the <b>";
	myMessage += masterRoleDict[g.playerList[target].role] + "</b>, a <b>";
	myMessage += masterTeamDict[g.playerList[target].team] + "</b>.</p>";

	g.playerList[myID].used = true;
	g.stepList.unshift(g.stepList.shift(), "lynch"); //go back to lynch
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_spiritualist.interrupt = true;
STEP_spiritualist.role_requirement = 20;
STEP_spiritualist.role_link = 20;
STEP_spiritualist.prompt_type = "target-dead-only";
STEP_spiritualist.prompt_subject = null;
STEP_spiritualist.prompt_string = "<p class='modVoice'>What player is the Spiritualist investigating?</p>";
STEP_spiritualist.no_target_invalid = true;
STEP_spiritualist.requires_dead_players = true;
STEP_spiritualist.timer = TIMER_SHORT;

// day phase steps - conclusion

function STEP_judgeMultiplex() {
	//responsible for adding STEP_judge or STEP_JudgeApprentice; ALWAYS EXACTLY ONE
	var judgeID;
	var apprenticeID;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 1) {
			judgeID = i;
		} else if (g.playerList[i].role == 3) {
			apprenticeID = i;
		}
	}
	if ((g.playerList[judgeID].deathCycleNum != null) && (g.playerList[apprenticeID].choice == 1)) {
		g.stepList.unshift(g.stepList.shift(), "judgeApprentice");
	} else {
		g.stepList.unshift(g.stepList.shift(), "judge");
	}
	return 0;
}
STEP_judgeMultiplex.role_requirement = 1;
STEP_judgeMultiplex.prompt_type = "auto";
STEP_judgeMultiplex.prompt_subject = null;

function STEP_judge(target) {
	//responsible for calling onDeath(playerNum) for each death player
	var myMessage = "";
	if (target == 77) {
		g.log += "w";
		myMessage += "<p class='modVoice'>The Judge either chose to hang no one, or is dead.</p>";
		myMessage += "<p class='modVoice'>If anyone is passionately opposed to no one being hung, here's one last chance to volunteer.</p>";
		g.stepList.unshift(g.stepList.shift(), "lynchVolunteer");
	} else if (g.playerList[target].role == 15 && g.cycleNum < 4) { //emissary
		g.log += "W";
		myMessage += "<p class='modVoice'>The Judge chose to hang " + pn(target);
		myMessage += "<p class='modSecret'>(" + pn(target) + " is the Emissary.)</p>";
		myMessage += ", but " + pn(target) + " survived!</p>";
		myMessage += onSurvival(target);
	} else if (g.playerList[target].role == 0 && g.cycleNum == 1 && villageHandicap) { //priest
		myMessage += "<p class='modVoice'>The town chose to hang " + pn(target);
		myMessage += ", but " + pn(target) + " mysteriously survived!</p>";
		myMessage += "<p class='modSecret'>(" + pn(target) + " is the Priest, and the Village team handicap is in effect.)</p>";
		myMessage += "<p class='modVoice'>The town goes to sleep disappointed.</p>";
		myMessage += onSurvival(target);
	} else {
		g.log += "W";
		myMessage += "<p class='modVoice'>The Judge chose to hang " + pn(target) + "!</p>";
		if (g.playerList[target].extraLives > 0) {
			if (g.playerList[target].extraLives > 1) {
				myMessage += "<p class='modSecret'>(The Judge ignored " + pn(target) + "'s extra lives.)</p>";
			} else {
				myMessage += "<p class='modSecret'>(The Judge ignored " + pn(target) + "'s extra life.)</p>";
			}
		}
		myMessage += "<p class='modVoice'>" + pn(target) + " is now dead.</p>";
		kill(target);
		onDeath(target);
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_judge.role_link = 1;
STEP_judge.prompt_type = "target";
STEP_judge.prompt_subject = null;
STEP_judge.prompt_string = "<p class='modVoice'>Judge, who would you like to hang?</p><p class='modVoice'>As a reminder, your hanging ignores extra lives, and 'No One' is a valid option.</p>";
STEP_judge.no_target_string_override = "No One";
STEP_judge.timer = TIMER_SHORT;
STEP_judge.allow_PT = true;

function STEP_judgeApprentice(target) {
	//responsible for calling onDeath(playerNum) for each death player
	return STEP_judge(target);
}
STEP_judgeApprentice.role_link = 3;
STEP_judgeApprentice.prompt_type = "target";
STEP_judgeApprentice.prompt_subject = "Apprentice";
STEP_judgeApprentice.prompt_string = STEP_judge.prompt_string;
STEP_judgeApprentice.no_target_string_override = STEP_judge.no_target_string_override;
STEP_judgeApprentice.timer = TIMER_SHORT;
STEP_judgeApprentice.allow_PT = true;

function STEP_lynchVolunteer(target) {
	//responsible for calling onDeath(playerNum) for each death player

	var myMessage = "";
	if (target == 77) {
		myMessage += "<p class='modVoice'>And thus, no one was killed by the town today!</p>";
		myMessage += "<p class='modVoice'>Town, stay asleep, and we'll move on night.</p>";
	} else if (g.playerList[target].role == 15 && g.cycleNum <= 3) { //emissary
		myMessage += "<p class='modVoice'>" + pn(target);
		myMessage += "volunteered to be hung, but mysteriously survived!</p>";
		myMessage += "<p class='modSecret'>(" + pn(target) + " is the Emissary.)</p>";
		myMessage += "<p class='modVoice'>Well, that was weird.  Anyway, the town stayed asleep as night fell.</p>";
		myMessage += onSurvival(target);
	} else if (g.playerList[target].extraLives > 0) {
		g.playerList[target].extraLives -= 1;
		myMessage += "<p class='modVoice'>" + pn(target);
		myMessage += "volunteered to be hung, but mysteriously survived!</p>";
		myMessage += "<p class='modSecret'>(" + pn(target) + " had an extra life.)</p>";
		myMessage += "<p class='modVoice'>Well, that was weird.  Anyway, the town stayed asleep as night fell.</p>";
		myMessage += onSurvival(target);
	} else if (g.playerList[target].role == 0 && g.cycleNum == 1 && villageHandicap) { //priest
		myMessage += "<p class='modVoice'>" + pn(target);
		myMessage += "volunteered to be hung, but mysteriously survived!</p>";
		myMessage += "<p class='modSecret'>(" + pn(target) + " is the Priest, and the Village team handicap is in effect.)</p>";
		myMessage += "<p class='modVoice'>Well, that was weird.  Anyway, the town stayed asleep as night fell.</p>";
		myMessage += onSurvival(target);
	} else {
		myMessage += "<p class='modVoice'>Suddenly, " + pn(target) + " volunteered to be hung! Before everyone knew what was happening, they were dead.</p>";
		myMessage += "<p class='modVoice'>The town agreed to never forget " + pn(target) + "'s sacrifice, and immediately went to sleep.</p>";
		kill(target);
		onDeath(target);
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_lynchVolunteer.prompt_type = "target";
STEP_lynchVolunteer.prompt_subject = "Volunteer?";
STEP_lynchVolunteer.prompt_string = "Would anyone like to volunteer?";
STEP_lynchVolunteer.no_target_string_override = "Nope";
STEP_lynchVolunteer.timer = TIMER_SHORT;

function STEP_BOD(target) {
	//onDeath method is responsible for adding this
	var BODID;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 17) {
			BODID = i;
			break;
		}
	}
	if (BODID == target) {
		return 8; //cannot self target
	}
	var myMessage = "";
	if (target == 77) {
		myMessage += "<p class='modSecret'>(" + pn(BODID) + " the Benevolent Old Dame secretly took their gift to the grave.)</p>";
	} else {
		g.playerList[target].extraLives += 1;
		g.playerList[BODID].used += 1;
		g.log += "+";
		logPlayer(target, 0);
		myMessage += "<p class='modVoice'>" + pn(BODID) + " the Benevolent Old Dame has generously given ";
		myMessage += g.playerList[target].name + " an extra life as she died!</p>";
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_BOD.role_link = 17;
STEP_BOD.prompt_type = "target";
STEP_BOD.prompt_subject = "B.O.D.";
STEP_BOD.prompt_string = "<p class='modSecret'>(Would the B.O.D. like to publicly give someone an extra life?)</p>";
STEP_BOD.death_exception = true;
STEP_BOD.timer = TIMER_VERY_SHORT;

function STEP_DOB(target) {
	//onDeath method is responsible for adding this
	//responsible for calling onDeath(playerNum) for each death player
	var DOBID;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 5) {
			DOBID = i;
			break;
		}
	}
	if (DOBID == target) {
		return 9; //cannot self target
	}
	var myMessage = "";
	if (target == 77) {
		myMessage += "<p class='modSecret'>(" + pn(DOBID) + " the Dirty Old Bastard secretly took their vengeance to the grave.)</p>";
	} else if (g.playerList[target].extraLives > 0) {
		g.playerList[DOBID].used += 1;
		g.playerList[target].extraLives -= 1;
		myMessage += "<p class='modVoice'>" + pn(DOBID) + " the Dirty Old Bastard suddenly tried to take ";
		myMessage += pn(target) + " with them, but " + pn(target) + " somehow survived!</p>";
		myMessage += "<p class='modSecret'>(" + pn(target) + " had an extra life.)</p>";
		myMessage += "<p class='modVoice'>Man, today just keeps getting worse and worse for " + pn(DOBID) + ".</p>";
		myMessage += onSurvival(target);
	} else if (g.playerList[target].role == 0 && g.cycleNum == 1 && villageHandicap) { //priest, handicap
		g.playerList[DOBID].used += 1;
		myMessage += "<p class='modVoice'>" + pn(DOBID) + " the Dirty Old Bastard suddenly tried to take ";
		myMessage += pn(target) + " with them, but " + pn(target) + " somehow survived!</p>";
		myMessage += "<p class='modSecret'>(" + pn(target) + " is the Priest and the Village team handicap is in effect.)</p>";
		myMessage += "<p class='modVoice'>Man, today just keeps getting worse and worse for " + pn(DOBID) + ".</p>";
		myMessage += onSurvival(target);
	} else {
		g.playerList[DOBID].used += 1;
		myMessage += "<p class='modVoice'>" + pn(DOBID) + " the Dirty Old Bastard suddenly took ";
		myMessage += pn(target) + " with them!</p>";
		if (g.playerList[target].role == 15 && g.cycleNum <= 3) {
			myMessage += "<p class='modSecret'>(" + pn(target) + " was the Emissary, but the Emissary card doesn't say anything about dirty bastards!)</p>";
		}
		myMessage += "<p class='modVoice'>Now " + pn(target) + " is dead too!</p>";
		kill(target);
		onDeath(target);
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_DOB.role_link = 5;
STEP_DOB.prompt_type = "target";
STEP_DOB.prompt_subject = "D.O.B.";
STEP_DOB.prompt_string = "<p class='modSecret'>(Would the D.O.B. like to kill someone?)</p>";
STEP_DOB.death_exception = true;
STEP_DOB.timer = TIMER_VERY_SHORT;

function STEP_victoryCheckA() {
	//responsible for changing phase and clearing g.stepList if needed
	result = victoryHelper(true);
	//console.log(result);
	if (result[0] == 1) {
		g.currentPhase = "Village Win";
		g.stepList = [];
	} else if (result[0] == 2) {
		g.currentPhase = "Witch Win";
		g.stepList = [];
	}
	return 0;
}
STEP_victoryCheckA.prompt_type = "auto";
STEP_victoryCheckA.prompt_subject = null;

function STEP_victoryCheckB() {
	//responsible for changing phase and clearing g.stepList if needed
	result = victoryHelper(false);
	if (result[0] == 1) {
		g.currentPhase = "Village Win";
		g.stepList = [];
	} else if (result[0] == 2) {
		g.currentPhase = "Witch Win";
		g.stepList = [];
	}
	return 0;
}
STEP_victoryCheckB.prompt_type = "auto";
STEP_victoryCheckB.prompt_subject = null;

function victoryHelper(isDay) {

	if (g.forfeitFlag == "village") {
		return [2,-99]; //villagers forfeit
	} else if (g.forfeitFlag == "witch") {
		return [1,-99]; //witches forfeit
	}

	var aliveCount = [0,0];
	var bannedCount = 0;
	var dayKillCount = [0,0];
	var nightKillCount = [0,0];
	var delayedKillCount = [0,0];
	var bonusKillCount = [0,0];
	var actualExtraLives = [0,0];
	var actualDayKillCount = [0,0];
	var actualNightKillCount = [0,0];
	var actualDelayedKillCount = [0,0];
	var deathRequiredToKillCount = [0,0];
	var judgeControl = [0,0];
	var actualJudgeControl = [0,0];
	var judgeLives = [0,0];
	var possibleLooseCannonExtraLives = [0,0];
	var comboKillFlag = false; //loose cannon turns extra lives into kills
	var actualWitchAssassin = false;
	var judgeP = null;
	var gdP = null;
	var apprenticeP = null;

	for (var i = 0; i < g.playerList.length; i++) {
		var p = g.playerList[i];
		var x = Number(p.team < 0);
		if (p.deathCycleNum == null) {
			if (p.isBanned && p.team >= 0) {
				bannedCount++;
			}
			else {
				aliveCount[x] += 1;
				actualExtraLives[x] += p.extraLives;
			}
		}
		switch (p.role) {
			case 1: //judge
				judgeP = p;
				judgeControl[x] = 3;
				if (p.deathCycleNum == null) {
					actualJudgeControl[x] = 3;
					judgeLives[x] += 1 + p.extraLives;
				}
				break;
			case 2: //gd
				gdP = p;
				break;
			case 3: //apprentice
				apprenticeP = p;
				if (p.choice == 1 || x == 0) { //witches always assume town apprentice picks judge
					judgeControl[x] = Math.max(judgeControl[x], 2);
					if (p.choice == 1 && p.deathCycleNum == null) {
						actualJudgeControl = Math.max(actualJudgeControl[x], 2);
						judgeLives[x] += 1 + p.extraLives;
					}
				}
				break;
			case 5: //DOB
				if (p.used && p.deathCycleNum != null) {
					//known dead
				} else {
					dayKillCount[x] += 1;
					if (p.deathCycleNum == null) {
						actualDayKillCount[x] += 1;
					}
					deathRequiredToKillCount[x] += 1;
				}
				break;
			case 10: //hunter
				if (g.hunterNight == g.cycleNum) {
					nightKillCount[x] += 1;
					if (p.deathCycleNum == null) {
						actualNightKillCount[x] += 1;
					}
				} else if (g.hunterNight == null) {
					delayedKillCount[x] += 1;
					if (p.deathCycleNum == null) {
						delayedKillCount[x] += 1;
					}
				}
				break;
			case 11: //peeping tom
				if (g.bombHolder != null || g.hunterNight == g.cycleNum) {
					nightKillCount[x] += 1;
					judgeControl[x] = Math.max(judgeControl[x], 1);
					if (p.deathCycleNum == null && !p.used) {
						actualJudgeControl[x] = Math.max(actualJudgeControl[x], 1);
						actualNightKillCount[x] += 1;
					}
				} else if (g.hunterNight == null) {
					delayedKillCount[x] += 1;
					if (p.deathCycleNum == null && !p.used) {
						delayedKillCount[x] += 1;
					}
				}
				break;
			case 12: //loose cannon
				if (p.used && p.deathCycleNum != null) {
					//known dead
				} else {
					dayKillCount[x] += 1;
					if (p.deathCycleNum == null) {
						actualDayKillCount[x] += 1;
						possibleLooseCannonExtraLives[x] + p.extraLives;
					}
					deathRequiredToKillCount[x] += 1;
					if (x == 0) {
						comboKillFlag = 1;
					}
				}
				break;
			case 18: //bomber
				if (g.bombHolder != null) {
					nightKillCount[x] += 1;
					if (p.deathCycleNum == null) {
						actualNightKillCount[x] += 1;
					}
				}
				break;
			case 19: //assassin
				if (!p.used) {
					dayKillCount[x] += 1;
					if (p.deathCycleNum == null) {
						actualDayKillCount[x] += 1;
						if (p.team < 0) {
							witchAssassin = true;
						}
					}
				}
				break;
			case 13: //nurse
				if (!p.used) {
					possibleLooseCannonExtraLives[x] += 1;
				}
				break;
			default: //other
				break;
		}
	}
	if (judgeP.team >= 0) {
		if (gdP.team < 0 && judgeP.deathCyclePhase === "Day") { //witch gravedigger saw town judge die, and either saw apprentice die or has witch apprentice
			if (gdP.deathCycleNum == null || gdP.deathCycleNum > judgeP.deathCycleNum) {
				if (apprenticeP.team < 0) {
					judgeControl[0] = 0;
				} else if (apprenticeP.deathCyclePhase === "Day") {
					if (gdP.deathCycleNum == null || gdP.deathCycleNum > apprenticeP.deathCycleNum) {
						judgeControl[0] = 0;
					}
				}
			}
		}
		if (apprenticeP.team < 0 && judgeP.deathCyclePhase === "Day") { //witch apprentice saw judge die
			if (apprenticeP.choice === 1) { //judge-apprentice witch
				judgeControl[0] = 0;
			} else if (apprenticeP.choice === 2 && gdP.deathCycleNum !== null && judgeP.deathCycleNum > gdP.deathCycleNum) { //gd-apprentice witch, dead town gd
				if (apprenticeP.deathCycleNum == null || apprenticeP.deathCycleNum > judgeP.deathCycleNum) {
					judgeControl[0] = 0;
				}
			}
		}
	} else if (judgeLives[1] == 0) { //witch judge is dead
		judgeControl[1] = 0;
	}

	if (comboKillFlag) { //leeroy can convert all possible loose extra lives into possible kills
		bonusKillCount[x] += possibleLooseCannonExtraLives[x];
	}
	if (isDay) { //if it's currently day, treat all villager night kills as delayed kills
		delayedKillCount[0] += nightKillCount[0];
		nightKillCount[0] = 0;
	}

	var delta = aliveCount[0] - aliveCount[1];
	if (aliveCount[0] == 0) {
		return [2,aliveCount[1]];      // all villagers are dead -- witches win
	} else if (aliveCount[1] == 0) {
		if (bannedCount > 0) {
			return [2,-98];      // all witches are dead but a modkilled "cursed" player was never removed by the village -- villagers forfeit and witches win
		} else {
			return [1,aliveCount[0]];      // all witches are dead -- villagers win
		}
	} else if (delta > 0) {
		return [0,delta];              // vote still in village team's favor -- they have a chance no matter what
	}

	if (aliveCount[0] == 1) { // 1v1 special case -- full team information known
		if (aliveCount[1] > 1) { // 1vX - impossible to win with existing mechanics
			if (actualDayKillCount + actualNightKillCount >= aliveCount[1])
			{
				return [0,66]; // last villager is somehow packing enough kills...
			} else {
				return [2,aliveCount[1],aliveCount[1]-aliveCount[0]];
			}
		} else if (actualDayKillCount[0] > 0 || actualNightKillCount[0] > 0) {
			return [0,77]; // last villager is packing a kill
		} else if (actualJudgeControl[0] > 0) {
			return [0,88]; // last villager is the judge (let them do the honors)
		} else if (actualWitchAssassin) {
			return [0,99]; // last witch is the assassin, and might plausibly kill self guessing one of the above weaknesses
		} else {
			return [2,1];
		}
	}

	// past this point, we are now reduced to cases where there are at least 2 town members, facing an equal or greater number of witches

	/*
		1) establish delta (villager votes - witch votes)
		2) go down list of things that might modify it
		3) if best case delta reachs > 0, return [0,0, ...]
		4) else return [2,0,...]
	*/

	if (delta == 0 && judgeControl[0] > judgeControl[1]) {
		return [0, 80 + judgeControl[0]];
	}

	var runningTotalShift = 0; //
	if (bonusKillCount[0] > 0) {
		delta += bonusKillCount[0];
		judgeControl[1] = 0;
		if (delta > 0 || (delta == 0 && judgeControl[0] > judgeControl[1])) {
			return [0, 0, delta];
		}
	}
	if (dayKillCount[0] > 0 || nightKillCount[0] > 0) {
		var shift = Math.min(aliveCount[0], dayKillCount[0] - deathRequiredToKillCount[0] + nightKillCount[0]);
		runningTotalShift += shift;
		delta += shift;
		judgeControl[1] = 0;
		if (delta > 0 || (delta == 0 && judgeControl[0] > judgeControl[1])) {
			return [0, 0, 0, delta];
		}
	}
	if (isDay && ((delta < 0 && actualExtraLives[0] == 0) || judgeControl[1] > judgeControl[0])) { //assume witches make a daykill if they can
		delta -= 1;
	}
	if (delayedKillCount[0] > 0) {
		delta += Math.min(aliveCount[0] - runningTotalShift, delayedKillCount[0]);
		judgeControl[1] = 0;
		if (delta > 0 || (delta == 0 && judgeControl[0] > judgeControl[1])) {
			return [0, 0, 0, 0, delta];
		}
	}
	return [2,aliveCount[1], delta]
}

function STEP_bombPassCheck() {
	//responsible for adding STEP_bombPass
	if (g.bombHolder != null) {
		g.stepList.unshift(g.stepList.shift(), "bombPass");
	}
	return 0;
}
STEP_bombPassCheck.role_requirement = 18;
STEP_bombPassCheck.prompt_type = "auto";
STEP_bombPassCheck.prompt_subject = null;

function STEP_bombPass(target) {
	var oldHolder = g.bombHolder;
	myMessage = "";
	if (target == 77) {
		g.log += "$";
		if (g.playerList[g.bombHolder].deathCycleNum != null) {
			g.bombHolder = null;
			myMessage += "<p class='modVoice'>" + pn(oldHolder) + " took the Bomb with them to the grave.</p>";
		} else {
			myMessage += "<p class='modVoice'>" + pn(oldHolder) + " decided not to pass the Bomb.</p>";
		}
	} else {
		g.bombHolder = target;
		myMessage += "<p class='modVoice'>" + pn(oldHolder) + " passed the Bomb to " + pn(g.bombHolder) + "!</p>";
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_bombPass.bomb_link = true; //unused
STEP_bombPass.prompt_type = "target";
STEP_bombPass.prompt_subject = "Bomb Pass";
STEP_bombPass.prompt_string = "<p class='modVoice'>Would the person with the Bomb like to pass it?</p>";
STEP_bombPass.death_exception = false; //shouldn't be needed, oh well
STEP_bombPass.timer = TIMER_SHORT;

// night phase steps

function STEP_nightStart() {
	var myMessage = "";
	if (g.cycleNum == 1) {
		myMessage += "<p class='modVoice'>It is now Night 1, so everyone should be asleep.</p>";
		myMessage += "<p class='modVoice'>You may not open your eyes, speak, make hand signals, or communicate in any way while you are supposed to be asleep.</p>";
	} else {
		myMessage += "<p class='modVoice'>It is now Night " + g.cycleNum + ".</p>";
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_nightStart.prompt_type = "info";
STEP_nightStart.prompt_subject = "Night Start";
STEP_nightStart.timer = TIMER_SHORT;

function STEP_gravediggerMultiplex() {
	//responsible for adding STEP_gravedigger or STEP_gravediggerApprentice; ALWAYS EXACTLY ONE
	var gravediggerID;
	var apprenticeID;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 2) {
			gravediggerID = i;
		} else if (g.playerList[i].role == 3) {
			apprenticeID = i;
		}
	}
	if ((g.playerList[gravediggerID].deathCycleNum != null) && (g.playerList[apprenticeID].choice == 0)) {
		g.stepList.unshift(g.stepList.shift(), "gravediggerApprentice");
		g.wakeupList.push(apprenticeID);
	} else {
		g.stepList.unshift(g.stepList.shift(), "gravedigger");
		g.wakeupList.push(gravediggerID);
	}
	return 0;
}
STEP_gravediggerMultiplex.role_requirement = 2;
STEP_gravediggerMultiplex.prompt_type = "auto";
STEP_gravediggerMultiplex.prompt_subject = null;

function STEP_gravedigger() {
	var deadList = [];
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].deathCycleNum == g.cycleNum) {
			deadList.push(i);
		}
	}
	var myMessage = "";
	switch(deadList.length) {
		case 0:
			myMessage += "<p class='modVoice'>Unfortunately Gravedigger, nobody died today.</p>";
			myMessage += "<p class='modVoice'>I've got nothing for you; maybe tomorrow night!</p>";
			break;
		case 1:
			if (g.cycleNum == 1) {
				myMessage += "<p class='modVoice'>Gravedigger, while " + pn(deadList[0]) + " decides what to do as an Angel or Demon, I'm going to show you " + pn(deadList[0]) + "'s cards.</p>";
			} else {
				myMessage += "<p class='modVoice'>Gravedigger, while the Angels and Demons decide what to do, I'm going to show you " + pn(deadList[0]) + "'s cards.</p>";
			}
			break;
		default:
			myMessage += "<p class='modVoice'>Gravedigger, while the Angels and Demons decide what to do, I'm going to show you the cards of everyone who died today.</p>";
			myMessage += "<p class='modVoice'>That includes ";
			for (var i = 0; i < deadList.length - 2; i++) {
				myMessage += pn(deadList[i]) + ", ";
			}
			myMessage += pn(deadList[1]) + " and " + pn(deadList[0]) + ".</p>";
			break;
	}
	if (g.deadRole && g.peepingTomActive == null) {
		myMessage += "<p class='modSecret'>(There is no Gravedigger.)</p>";
	} else {
		for (var i = 0; i < deadList.length; i++) {
			myMessage += "<p class='modShow'><b>" + pn(deadList[i]) + "</b> was the <b>";
			myMessage += masterRoleDict[g.playerList[deadList[i]].role] + "</b>, a <b>";
			myMessage += masterTeamDict[g.playerList[deadList[i]].team] + "</b>.</p>";
			if (g.playerList.length - g.aliveNum - deadList.length > 0) {
				myMessage += "<p class='modSecret'>(Let the other dead players see too.)</p>";
			}
		}
	}
	g.gravediggerTrigger = false;
	myMessage += "<p class='modVoice'>Thank you Gravedigger, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_gravedigger.role_link = 2;
STEP_gravedigger.prompt_type = "info";
STEP_gravedigger.prompt_subject = null;
STEP_gravedigger.timer = TIMER_SHORT;
STEP_gravedigger.allow_PT = true;


function STEP_gravediggerApprentice() {
	return STEP_gravedigger();
}
STEP_gravediggerApprentice.role_link = 3;
STEP_gravediggerApprentice.prompt_type = "info";
STEP_gravediggerApprentice.prompt_subject = "Apprentice";
STEP_gravediggerApprentice.timer = TIMER_SHORT;
STEP_gravediggerApprentice.allow_PT = true;


function STEP_angelTutorial() {
	//responsible for all Demon instructions, adding STEP_demonSoloMultiplex or STEP_demonMultiplex
	//also responsible for handling the all-dead case, one-dead case (STEP_angelProtection if needed)
	//finally, responsible for adding STEP_angelMultiplex if not one of those two cases
	var angels = 0;
	var demons = 0;
	var soloName = "dummy";
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].deathCycleNum != null) {
			if (g.playerList[i].team < 0) {
				demons++;
			} else {
				angels++;
			}
			soloName = i;
		}
	}
	myMessage = "";
	var deadCount = g.playerList.length - g.aliveNum;
	if (deadCount == 0) {
		switch (g.cycleNum) {
			case 1:
				myMessage += "<p class='modVoice'>This is where we'd have the Demons and Angels make their choices, but there aren't any!</p>";
				myMessage += "<p class='modVoice'>Maybe we will have some dead players tomorrow night?</p>";
				break;
			case 2:
				myMessage += "<p class='modVoice'>Wow, we still have no Angels or Demons?!?</p>";
				myMessage += "<br>";
				myMessage += "<p class='modVoice'>Maybe tomorrow night...</p>";
				break;
			case 3:
				myMessage += "<p class='modVoice'>Wait, no dead players?  STILL?  This is stupid.</p>";
				break;
			default:
				myMessage += "<p class='modVoice'>CAN YOU PEOPLE DIE ALREADY?!?</p>";
				break;
		}
	} else if (deadCount == 1) {
		if (g.angelTutorialStep < 1) { //first night this has happened
			myMessage += "<p class='modVoice'>It's a shame that " + pn(soloName) + " is dead, but now they get to have fun in the afterlife.</p>";
			myMessage += "<p class='modVoice'>Not only do they get to see everything now instead of closing their eyes, but they also get to be the first Angel or Demon!</p>";
			myMessage += "<br>";
			myMessage += "<p class='modVoice'>If " + pn(soloName) + " was a bad guy they are now a Demon, and can <span class='keyword-highlight-demon'>Meddle</span> with two people tonight! This means you can pick a Villager and a Witch, and if the Priest checks either of them tonight he will get the result for the other one.</p>";
			myMessage += "<p class='modVoice'>On the other hand, if " + pn(soloName) + " was a Villager, they are now an Angel who can <span class='keyword-highlight-angel'>Protect</span> someone. This only lasts for tonight, but there is no limit to who you can protect or how many times.</p>";
			myMessage += "<br>";
			myMessage += "<p class='modVoice'>Either way, whether you are a Demon Meddling with two people or an Angel Protecting one, who will you do it to?</p>";
			if (g.gravediggerTrigger) {
				myMessage += "<p class='modVoice'>You can decide while I show the Gravedigger their information.</p>";
			}
			g.angelTutorialStep = 1;
		} else {
			myMessage += "<p class='modVoice'>It looks like " + pn(soloName) + " is still alone in the afterlife.</p>";
			myMessage += "<br>";
			myMessage += "<p class='modVoice'>Maybe tomorrow night you will get some company...</p>";
		}
	} else { //deadCount > 1
		switch (g.cycleNum) {
			case 1:
				myMessage += "<p class='modVoice'>Looks like we are kicking this game off to a bloody start! The good news is, our dead friends get to continue playing as Angels or Demons, based on what team they are on.</p>";
				myMessage += "<br>";
				myMessage += "<p class='modVoice'>So first, if either of you was a Witch, you are now a Demon and can agree to <span class='keyword-highlight-demon'>Meddle</span> with two people tonight! This means you can pick two players, and if the Priest checks either of them tonight he will get the result for the other one.</p>";
				if (advancedRules) {
					myMessage += "<p class='modVoice'>Meanwhile, Angels get to vote on a target to <span class='keyword-highlight-angel'>Protect</span> each night, <i>as long as they outnumber the Demons</i>.</p>";
				} else {
					myMessage += "<p class='modVoice'>Meanwhile, Angels get to vote on a target to <span class='keyword-highlight-angel'>Protect</span> each night.";
				}
				myMessage += "<p class='modVoice'>There is only one rule about who you can protect: <strong>If you protect one of the two people the Demons are meddling with, you can do it tonight but may never protect that person again.</strong></p>";
				if (g.gravediggerTrigger) {
					myMessage += "<p class='modVoice'>Angels and Demons, please be making your decisions quickly while I show the Gravedigger their information.</p>";
				}
				g.angelTutorialStep = 2;
				break;
			default: //night 2+
				switch (g.angelTutorialStep) {
					case 0:
						myMessage += "<p class='modVoice'>Looks like we finally have some casualties.  The good news is, our dead friends get to continue playing as Angels or Demons, based on what team they are on.</p>";
						myMessage += "<br>";
						myMessage += "<p class='modVoice'>So first, if either of you was a Witch, you are now a Demon and can agree to <span class='keyword-highlight-demon'>Meddle</span> with two people tonight!  This means you can pick two players, and if the Priest checks either of them tonight he will get the result for the other one.</p>";
						if (advancedRules) {
							myMessage += "<p class='modVoice'>Meanwhile, Angels get to vote on a target to <span class='keyword-highlight-angel'>Protect</span> each night, <i>as long as they outnumber the Demons</i>.</p>";
						} else {
							myMessage += "<p class='modVoice'>Meanwhile, Angels get to vote on a target to <span class='keyword-highlight-angel'>Protect</span> each night.";
						}
						myMessage += "<p class='modVoice'>There is only one rule about who you can protect: <strong>If you protect one of the two people the Demons are meddling with, you can do it tonight but may never protect that person again.</strong></p>";
						if (g.gravediggerTrigger) {
							myMessage += "<p class='modVoice'>Angels and Demons, please be making your decisions quickly while I show the Gravedigger their information.</p>";
						}
						g.angelTutorialStep = 2;
						break;
					case 1:
						myMessage += "<p class='modVoice'>Now it's time for our Angels and Demons to do their business. Let me remind you how they interact.</p>";
						myMessage += "<p class='modVoice'>There is just one golden rule about who you can protect: <strong>If you protect one of the two people the Demons are meddling with, you can do it tonight but may never protect that person again.</strong></p>";
						if (advancedRules) {
							myMessage += "<p class='modVoice'>Also keep in mind, the Angels cannot protect while they are outnumbered by the Demons. (If that's the case, the town is doing just fine without your help!)</p>";
						}
						if (g.gravediggerTrigger) {
							myMessage += "<p class='modVoice'>Angels and Demons, please be deciding while I show the Gravedigger their information.</p>";
						}
						g.angelTutorialStep = 2;
						break;
					default: //case 2+
						if (advancedRules && g.angelTutorialStep == 2) {
							myMessage += "<p class='modVoice'>I'm going to remind you guys that once per game, the Angels are allowed to protect two people!</p>";
							myMessage += "<p class='modVoice'>Since the last Witch is allowed to kill two people a night, it might be a good idea to save this until the very end...</p>";
							g.angelTutorialStep = 3;
						}
						if (g.gravediggerTrigger) {
							myMessage += "<p class='modVoice'>Angels and Demons, please be deciding your targets while I show the Gravedigger their information.</p>";
						} else {
							myMessage += "<p class='modVoice'>With no information for our Gravedigger tonight, we go straight to our Demons and Angels.</p>";
						}
						break;
				}
		}
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_angelTutorial.prompt_type = "info";
STEP_angelTutorial.prompt_subject = "Dead Players";
STEP_angelTutorial.timer = TIMER_MEDIUM;

function STEP_demons1(target) {
	var myMessage = "";
	g.hauntingTargetList = [target];
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_demons1.prompt_type = "target-auto";
STEP_demons1.prompt_subject = "Demons";
STEP_demons1.prompt_string = "<p class='modVoice'>Who do the Demons want to <span class='keyword-highlight-demon'>Meddle</span> with?</p>";
STEP_demons1.target_restrictions = "demons";
STEP_demons1.timer = TIMER_MEDIUM;

function STEP_demons2(target) {
	var myMessage = "";
	var demonCount = 0;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].deathCycleNum != null) {
			if (g.playerList[i].team < 0) {
				demonCount++;
			}
		}
	}
	g.hauntingTargetList.push(target);
	if (demonCount == 0) {
		myMessage += "<p class='modSecret'>(There are no demons yet.)</p>";
		g.hauntingTargetList = [];
	} else if (target == 77 || g.hauntingTargetList[0] == 77 || g.hauntingTargetList[0] == target) {
		myMessage += "<p class='modSecret'>(The Demons could not decide who to Meddle with.)</p>";
		g.hauntingTargetList = [];
	} else if ((g.playerList[g.hauntingTargetList[0]].covenJoinCycleNum === null) &&
				(g.playerList[target].covenJoinCycleNum === null)) {
		myMessage += "<p class='modSecret'>(The Demons meddled with ";
		myMessage += pn(g.hauntingTargetList[0]) + " and " + pn(g.hauntingTargetList[1]) + ", discouraging the Angels from protecting either.)</p>";
	} else if ((g.playerList[g.hauntingTargetList[0]].covenJoinCycleNum !== null) &&
				(g.playerList[target].covenJoinCycleNum !== null)) {
		myMessage += "<p class='modSecret'>(The Demons meddled with ";
		myMessage += pn(g.hauntingTargetList[0]) + " and " + pn(g.hauntingTargetList[1]) + ", but they are <i>both</i> in the coven...)</p>";
	}  else {
		myMessage += "<p class='modSecret'>(The Demons meddled with ";
		myMessage += pn(g.hauntingTargetList[0]) + " and " + pn(g.hauntingTargetList[1]) + ", so the Priest will be given incorrect results for checking either.)</p>";
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_demons2.prompt_type = "target";
STEP_demons2.prompt_subject = "Demons";
STEP_demons2.prompt_string = "<p class='modSecret'>(Who else do the Demons want to <span class='keyword-highlight-demon'>Meddle</span> with?)</p>";
STEP_demons2.target_restrictions = "demons";
STEP_demons2.timer = TIMER_SHORT;

function STEP_angels(target) {
	//responsible for adding STEP_angelProtectionDoublePrompt
	if (target == 77) {
		//pass
	} else if (g.playerList[target].protectionInvalid) {
		g.stepList.unshift(g.stepList.shift(), "angelProtectionInvalid");
	} else if (g.angelProtectList.indexOf(target) != -1) {
		g.stepList.unshift(g.stepList.shift(), "angelDoubleProtectionInvalid");
	} else {
		if (g.angelProtectList.length > 0) {
			g.doubleProtectUsed = true;
		}
		g.angelProtectList.push(target);
		g.nightProtectList.push(2*100+target);
		if (g.hauntingTargetList.indexOf(target) != -1) {
			g.playerList[target].protectionInvalid = true;
		}
		if (advancedRules && !g.doubleProtectUsed) {
			g.stepList.unshift(g.stepList.shift(), "angelProtectionDoublePrompt");
		}
	}
	return 0;
}
STEP_angels.prompt_type = "target-auto";
STEP_angels.prompt_subject = "Protection";
STEP_angels.prompt_string = "<p class='modVoice'>Who do the Angels want to <span class='keyword-highlight-angel'>Protect</span>?</p>";
STEP_angels.target_restrictions = "angels";
STEP_angels.timer = TIMER_SHORT;

function STEP_angelProtectionInvalid() {
	var myMessage = "<p class='modSecret'>(This player was previously protected while meddled with, and can never be protected by the Angels again!)</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_angelProtectionInvalid.prompt_type = "info";
STEP_angelProtectionInvalid.prompt_subject = "Protection Invalid";
STEP_angelProtectionInvalid.timer = TIMER_VERY_SHORT;

function STEP_angelProtectionDoublePrompt(choice) {
	if (choice == 0) {
		g.stepList.unshift(g.stepList.shift(), "angels");
	} else {
		//pass
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_angelProtectionDoublePrompt.prompt_type = "choice-auto";
STEP_angelProtectionDoublePrompt.prompt_subject = "Double Protection";
STEP_angelProtectionDoublePrompt.prompt_choices = ["Use it!", "Save it!"];
STEP_angelProtectionDoublePrompt.prompt_string = "<p class='modSecret'>(Are the Angels requesting to <span class='keyword-highlight-angel'>Protect</span> a second target? They can only do this once!)</p>";
STEP_angelProtectionDoublePrompt.no_target_invalid = true;
STEP_angelProtectionDoublePrompt.timer = TIMER_VERY_SHORT;

function STEP_angelDoubleProtectionInvalid() {
	var myMessage = "<p class='modSecret'>(Angels cannot protect the same player twice in one night. Nice try!)</p>";
	g.stepList.unshift(g.stepList.shift(), "angels");
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_angelDoubleProtectionInvalid.prompt_type = "info";
STEP_angelDoubleProtectionInvalid.prompt_subject = "Double Protection Invalid";
STEP_angelDoubleProtectionInvalid.timer = TIMER_VERY_SHORT;

function STEP_angelConclusion() {
	var myMessage = "";
	var angelCount = 0;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].deathCycleNum != null && !g.playerList[i].isBanned) {
			if (g.playerList[i].team >= 0) {
				angelCount++;
			}
		}
	}

	switch (g.angelProtectList.length) {
		case 0:
			myMessage += "<p class='modSecret'>(The Angels did not protect a target.)</p>";
			break;
		case 1:
			myMessage += "<p class='modSecret'>(The Angels protected " + pn(g.angelProtectList[0]) + ".)</p>";
			if (g.hauntingTargetList.indexOf(g.angelProtectList[0]) != -1) {
				myMessage += "<p class='modSecret'>(Because " + pn(g.angelProtectList[0]);
				myMessage += " was meddled with, the Angels may never protect ";
				myMessage += pn(g.angelProtectList[0]) + " again.)</p>";	;
			}
			break;
		default: //case 2
			myMessage += "<p class='modSecret'>(The Angels protected " + pn(g.angelProtectList[0]);
			myMessage += " and " + pn(g.angelProtectList[1]) + ").</p>";
			if (g.hauntingTargetList.indexOf(g.angelProtectList[0]) != -1) {
				myMessage += "<p class='modSecret'>(Because " + pn(g.angelProtectList[0]);
				myMessage += " was meddled with, the Angels may never protect ";
				myMessage += pn(g.angelProtectList[0]) + " again.)</p>";	;
			}
			if (g.hauntingTargetList.indexOf(g.angelProtectList[1]) != -1) {
				myMessage += "<p class='modSecret'>(Because " + pn(g.angelProtectList[1]);
				myMessage += " was meddled with, the Angels may never protect ";
				myMessage += pn(g.angelProtectList[1]) + " again.)</p>";	;
			}
			break;
	}
	myMessage += "<p class='modVoice'>Thank you Angels and Demons.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_angelConclusion.prompt_type = "info";
STEP_angelConclusion.prompt_subject = "Angels";
STEP_angelConclusion.timer = TIMER_VERY_SHORT;

function STEP_witchMultiplex() {
	//responsible for adding STEP_witchKill, STEP_witchKill2, and STEP_witchKillIllusion
	var covenCount = 0;
	for (var i = 0; i < g.playerList.length; i++) {
		if ((g.playerList[i].team < 0) && (g.playerList[i].deathCycleNum == null)) {
			covenCount += 1; //living members of witch team, could be non-coven
		}
	}

	if (g.illusionKillAvailable) {
		g.stepList.unshift(g.stepList.shift(), "witchKillIllusionPrompt");
	}
	if (covenCount == 1) {
		g.stepList.unshift(g.stepList.shift(), "witchKill2");
	}
	g.stepList.unshift(g.stepList.shift(), "witchKill");
	if (g.cycleNum < 3 || (g.cycleNum < 4 && advancedRules)) {
		g.stepList.unshift(g.stepList.shift(), "witchIntro");
	}
	return 0;
}
STEP_witchMultiplex.prompt_type = "auto";
STEP_witchMultiplex.prompt_subject = "Witches";

function STEP_witchIntro() {
	myMessage = "";
	switch (g.cycleNum) {
		case 1:
			myMessage += "<p class='modVoice'>Wake up Witches, and be careful not to make any detectable noise or motion.</p>";
			myMessage += "<p class='modVoice'>Each night the Witch Coven may agree to kill a target by silently pointing and nodding.</p>";
			myMessage += "<p class='modVoice'>If there is any disagreement, I will go with the plurality consensus; if you can't break a tie, you'll kill no one.</p>";
			myMessage += "<p class='modVoice'>With all that said, who would you like to kill?</p>";
			break;
		case 2:
			myMessage += "<p class='modVoice'>And now it is once again time for the Witches to do their dastardly deed.</p>";
			myMessage += "<p class='modVoice'>As a reminder, when there is one Witch left, they <b><i>MAY<i></b> kill two targets each night.</p>"
			myMessage += "<p class='modVoice'>They don't have to--they may prefer to not reveal the fact that there is only one Witch left.  However, the two kills cannot be stacked on the same target.</p>";
			break;
		case 3:
			myMessage += "<p class='modVoice'>Another night, another Witch Kill.</p>";
			if (advancedRules) {
				myMessage += "<p class='modVoice'>As one last reminder, the Witches may make an fake illusion kill once per game to cause confusion.  This looks like a normal kill, but the target always survives.</p>";
				myMessage += "<p class='modVoice'>This can be done instead of or in addition to their normal kill(s).</p>";
			}
			//no break
		default:
			break;
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_witchIntro.prompt_type = "info";
STEP_witchIntro.prompt_subject = "Witches";
STEP_witchIntro.timer = TIMER_SHORT;

function STEP_witchKill(target) {
	var covenCount = 0;
	var soloName;
	for (var i = 0; i < g.playerList.length; i++) {
		if ((g.playerList[i].covenJoinCycleNum != null) && (g.playerList[i].deathCycleNum == null)) {
			covenCount += 1;
			soloName = i;
			g.wakeupList.push(i);
		}
	}
	//responsible for not killing the same target twice; list should be empty before, so easy to check
	myMessage = "";
	if (target == 77) {
		if (g.nightKillList.length) {
			myMessage += "<p class='modSecret'>(" + pn(soloName) + " did not use their second kill.)</p>";
		} else {
			myMessage += "<p class='modSecret'>(The Witches killed no one tonight.)</p>";
		}
	} else if (g.nightKillList.length && g.nightKillList.indexOf(target) != -1) {
		//last stand second kill cannot be on the same target
		return 13;
	} else {
		if (g.nightKillList.length) {
			if (soloName == target) {
				myMessage += "<p class='modSecret'>(" + pn(soloName) + " used their second kill on themselves.)</p>";
			} else {
				myMessage += "<p class='modSecret'>(" + pn(soloName) + " used their second kill on " + pn(target) + ").</p>";
			}
		} else if (covenCount == 1) {
			if (soloName == target) {
				myMessage += "<p class='modSecret'>(" + pn(soloName) + " used their first kill on themselves.)</p>";
			} else {
				myMessage += "<p class='modSecret'>(" + pn(soloName) + " used their first kill on " + pn(target) + ").</p>";
			}
		} else {
			myMessage += "<p class='modSecret'>(The Witches agreed to kill " + pn(target) + ").</p>";
		}
		g.nightKillList.push(target);
		g.wakeupList.push(target);
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_witchKill.prompt_type = "target";
STEP_witchKill.prompt_subject = "Coven Kill";
STEP_witchKill.prompt_string = "<p class='modVoice'>Witches, who would you like to kill?</p>";
STEP_witchKill.timer = TIMER_MEDIUM;

function STEP_witchKill2(target) {
	return STEP_witchKill(target);
}
STEP_witchKill2.prompt_type = "target";
STEP_witchKill2.prompt_subject = "Last Stand 2";
STEP_witchKill2.prompt_string = "<p class='modSecret'>(Will the last Witch kill a second target?)</p>";
STEP_witchKill2.target_restrictions = "last stand";
STEP_witchKill2.timer = TIMER_SHORT;

function STEP_witchKillIllusionPrompt(choice) {
	if (choice == 0) {
		g.stepList.unshift(g.stepList.shift(), "witchKillIllusion");
	} else {
		//pass
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_witchKillIllusionPrompt.prompt_type = "choice-auto";
STEP_witchKillIllusionPrompt.prompt_subject = "Illusion Kill";
STEP_witchKillIllusionPrompt.prompt_choices = ["Use it!", "Save it!"];
STEP_witchKillIllusionPrompt.prompt_string = "<p class='modSecret'>(In addition to that, are the Witches requesting to use their fake kill? They can only do this once!)</p>";
STEP_witchKillIllusionPrompt.no_target_invalid = true;
STEP_witchKillIllusionPrompt.timer = TIMER_VERY_SHORT;

function STEP_witchKillIllusion(target) {
	var covenCount = 0;
	var soloName;
	for (var i = 0; i < g.playerList.length; i++) {
		if ((g.playerList[i].covenJoinCycleNum != null) && (g.playerList[i].deathCycleNum == null)) {
			covenCount += 1;
			soloName = i;
		}
	}
	//responsible for not killing the same target twice; list should be empty before, so easy to check
	myMessage = "";
	if (target == 77) {
		if (g.nightKillList.length) {
			myMessage += "<p class='modSecret'>(" + pn(soloName) + " changed their mind and saved their fake kill.)</p>";
		} else {
			myMessage += "<p class='modSecret'>(The Witches changed their mind and saved their fake kill.)</p>";
		}
	} else {
		g.illusionKillAvailable = false;
		g.nightKillList.push(target);
		g.nightProtectList.push(3*100+target);
		g.wakeupList.push(target);
		if (covenCount == 1) {
			if (target == soloName) {
				myMessage += "<p class='modSecret'>(" + pn(soloName) + " used the fake kill on themselves.)</p>";
			} else {
				myMessage += "<p class='modSecret'>(" + pn(soloName) + " used the fake kill on " + pn(target) + ".)</p>";
			}
		} else {
			myMessage += "<p class='modSecret'>(The Witches agreed to use the fake kill on " + pn(target) + ".)</p>";
		}
	}
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_witchKillIllusion.prompt_type = "target";
STEP_witchKillIllusion.prompt_subject = "Illusion Kill";
STEP_witchKillIllusion.prompt_string =  "<p class='modSecret'>(Who the Witches use their Illusion kill on?)</p>";
STEP_witchKillIllusion.no_target_string_override = "Nevermind, Save It";
STEP_witchKillIllusion.timer = TIMER_VERY_SHORT;

function STEP_priest(target) {
	//responsible for adding STEP_fanatic
	myMessage = "";
	g.lastPriestCheck = target;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 0) {
			g.wakeupList.push(i);
			break;
		}
	}
	if (target == 77) {
		if (g.deadRole) {
			myMessage += "<p class='modSecret'>(The Priest is dead.)</p>";
		} else {
			myMessage += "<p class='modSecret'>(The Priest checked no one.)</p>";
		}
	} else {
		var result;
		if (g.hauntingTargetList.length && target === g.hauntingTargetList[0]) {
			result = (g.playerList[g.hauntingTargetList[1]].covenJoinCycleNum != null);
		} else if (g.hauntingTargetList.length && target === g.hauntingTargetList[1]) {
			result = (g.playerList[g.hauntingTargetList[0]].covenJoinCycleNum != null);
		} else {
			result = (g.playerList[target].covenJoinCycleNum != null);
		}
		if (result) {
			myMessage += "<p class='modThumbs'><span class='glyphicon glyphicon-thumbs-up'></span></p>";
			if (p.role == 0) {
				myMessage += "<p class='modSecret'>You are apparently a Witch.</p>";
				myMessage += "<p class='modSecret'>Shenanigans?  Shenanigans.</p>";
			} else {
				myMessage += "<p class='modSecret'>" + pn(target) + " <b>IS</b> in the Witch Coven!</p>";
			}
		} else {
			myMessage += "<p class='modThumbs'><span class='glyphicon glyphicon-thumbs-down'></span></p>";
			if (p.role == 0) {
				myMessage += "<p class='modSecret'>You are not a Witch.</p>";
				myMessage += "<p class='modSecret'>But you are... several other things.</p>";
			} else {
				myMessage += "<p class='modSecret'>" + pn(target) + " is <b>NOT</b> in the Witch Coven!</p>";
			}
		}
		if (g.playerList[target].role == 7) {
			g.stepList.unshift(g.stepList.shift(), "fanatic");
		}
		g.wakeupList.push(target);
	}
	if (g.cycleNum == 1) {
		//first time reminders
		myMessage += "<p class='modVoice'>I am giving you a <b>thumbs up</b> if they <b><i>are</i></b> in the Witch Coven, and a <b>thumbs down<b> if <b><i>not</i></b>.</p>";
		myMessage += "<p class='modVoice'>As a reminder, if there there are any Demons, they may be able to flip your checks with Shenanigans.</p>";
	} else {
		myMessage += "<p class='modVoice'>Thumbs up if they are in the Witch Coven, thumbs down if not.</p>";
	}
	myMessage += "<p class='modVoice'>Thank you Priest, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_priest.role_requirement = 0;
STEP_priest.role_link = 0;
STEP_priest.prompt_type = "target";
STEP_priest.prompt_subject = null;
STEP_priest.prompt_string = "<p class='modVoice'>Priest, who would you like to check to see if they are a Witch?</p>";
STEP_priest.timer = TIMER_SHORT;

function STEP_fanatic() {
	var fanaticID = "";
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 7) {
			g.playerList[i].extraLives += 1;
			fanaticID = i;
			break;
		}
	}
	g.log += "+";
	logPlayer(fanaticID, 0);
	myMessage = "";
	myMessage += "<p class='modSecret'>(Without letting anyone catch on, silently tap " + pn(fanaticID) + " on the head.)</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_fanatic.role_link = 7;
STEP_fanatic.prompt_type = "info";
STEP_fanatic.prompt_subject = null;
STEP_fanatic.timer = TIMER_VERY_SHORT;

function STEP_inquisitor(target) {
	var myMessage = "";
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 14) {
			g.wakeupList.push(i);
			break;
		}
	}
	if (target == 77) {
		if (g.deadRole && g.peepingTomActive == null) {
			myMessage += "<p class='modSecret'>(The Inquisitor is dead.)</p>";
		} else {
			myMessage += "<p class='modSecret'>(The Inquisitor checked no one.)</p>";
		}
	} else {
		var p = g.playerList[target];
		if (p.role == 14) {
			myMessage += "<p class='modSecret'>You have a <b>Informative</b> character.</p>";
			myMessage += "<p class='modSecret'>Way to clear up that mystery, chief.</p>";
		} else {
			myMessage += "<p class='modSecret'>" + pn(target) + " has a <b>" + categoryRoleDict[p.role] + "</b> character!</p>";
		}
	}
	if (g.cycleNum == 1) {
		//first time reminders
		myMessage += "<p class='modVoice'>Inquisitor, I'm going to show you what kind of character your target has.</p>";
	}
	myMessage += "<p class='modVoice'>Thank you Inquisitor, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_inquisitor.role_requirement = 14;
STEP_inquisitor.role_link = 14;
STEP_inquisitor.prompt_type = "target";
STEP_inquisitor.prompt_subject = null;
STEP_inquisitor.prompt_string = "<p class='modVoice'>Inquisitor, who would you like to check to see what category of character they have?</p>";
STEP_inquisitor.timer = TIMER_SHORT;
STEP_inquisitor.allow_PT = true;


function STEP_hunterCheck() {
	//responsible for adding STEP_hunter
	if (g.hunterNight == g.cycleNum) {
		g.stepList.unshift(g.stepList.shift(), "hunter");
	}
	return 0;
}
STEP_hunterCheck.role_requirement = 10;
STEP_hunterCheck.prompt_type = "auto";
STEP_hunterCheck.prompt_subject = null;

function STEP_hunter(target) {
	var myMessage = "";
	var hunterID = null;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 10) {
			hunterID = i;
			g.wakeupList.push(hunterID);
			break;
		}
	}
	if (target == 77) {
		if (g.deadRole && g.peepingTomActive == null) {
			myMessage += "<p class='modSecret'>(The Hunter is dead.)</p>";
		} else {
			myMessage += "<p class='modSecret'>(The Hunter decided to kill no one.)</p>";
		}
	} else {
		g.playerList[hunterID].used = true;
		var p = g.playerList[target];
		g.nightKillList.push(target);
		if (p.role == 10) {
			myMessage += "<p class='modSecret'>The Hunter shot themselves.  Really?</p>";
		} else {
			myMessage += "<p class='modSecret'>The Hunter shot " + pn(target) + ".</p>";
		}
	}
	myMessage += "<p class='modVoice'>Thank you Hunter, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_hunter.role_link = 10;
STEP_hunter.prompt_type = "target";
STEP_hunter.prompt_subject = null;
STEP_hunter.prompt_string = "<p class='modVoice'>Hunter, who would you like to kill?</p>";
STEP_hunter.timer = TIMER_SHORT;
STEP_hunter.allow_PT = true;

function STEP_bomberCheck() {
	//responsible for adding STEP_bomber
	if (g.bombHolder != null) {
		g.stepList.unshift(g.stepList.shift(), "bomber");
	}
	return 0;
}
STEP_bomberCheck.role_requirement = 18;
STEP_bomberCheck.prompt_type = "auto";
STEP_bomberCheck.prompt_subject = null;

function STEP_bomber(target) {
	var myMessage = "";
	var bomberID = null;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 18) {
			bomberID = i;
			g.wakeupList.push(bomberID);
			break;
		}
	}
	if (target == 77) {
		if (g.deadRole && g.peepingTomActive == null) {
			myMessage += "<p class='modSecret'>(The Bomber is dead.)</p>";
		} else {
			myMessage += "<p class='modSecret'>(The Bomber did not detonate the Bomb tonight.)</p>";
		}
	} else {
		g.playerList[bomberID].used = true;
		g.log += "#";
		var p = g.playerList[g.bombHolder];
		g.nightKillList.push(g.bombHolder);
		if (p.role == 18) {
			myMessage += "<p class='modSecret'>(The Bomber blew themselves up. Really?)</p>";
		} else {
			myMessage += "<p class='modVoice'>(The Bomber detonated the Bomb on " + pn(g.bombHolder) + ".)</p>";
			g.wakeupList.push(g.bombHolder);
		}
	}
	myMessage += "<p class='modVoice'>Thank you Bomber, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_bomber.role_link = 18;
STEP_bomber.prompt_type = "choice";
STEP_bomber.prompt_subject = null;
STEP_bomber.prompt_string = "<p class='modVoice'>Bomber, would you like to detonate the Bomb?</p>";
STEP_bomber.prompt_choices = ["Yes"];
STEP_bomber.no_target_string_override = "No";
STEP_bomber.timer = TIMER_SHORT;
STEP_bomber.allow_PT = true;

function STEP_watchmanCheck() {
	//responsible for adding STEP_watchman
	if (g.cycleNum == 1) {
		g.stepList.unshift(g.stepList.shift(), "watchman");
		g.wakeupList.push()
	}
	return 0;
}
STEP_watchmanCheck.role_requirement = 9;
STEP_watchmanCheck.prompt_type = "auto";
STEP_watchmanCheck.prompt_subject = null;

function STEP_watchman() {
	var watchmanID = null;
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 9) {
			watchmanID = i;
			g.wakeupList.push(watchmanID);
			break;
		}
	}
	var unwokenList = [];
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.wakeupList.indexOf(i) == -1) {
			unwokenList.push(i);
		}
	}
	var myMessage = "";
	myMessage += "<p class='modVoice'>Since it is the first night, I am going to show the Watchman a random person who did not wake up tonight.</p>";
	myMessage += "<p class='modVoice'>This means they can't be a Witch, nor the Priest.</p><br>";
	if (unwokenList.length) {
		shuffle(unwokenList);
		myMessage += "<p class='modShow'>(Point to " + pn(unwokenList[0]) + ".)</p>";
	} else {
		myMessage += "<p class='modShow'>(Somehow, everyone woke up.  This should be impossible. *shrug*)</p>";
	}
	myMessage += "<br><p class='modVoice'>Thank you Watchman, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_watchman.role_requirement = 9;
STEP_watchman.role_link = 9;
STEP_watchman.prompt_type = "info";
STEP_watchman.prompt_subject = "Watchman";
STEP_watchman.timer = TIMER_SHORT;
STEP_watchman.allow_PT = true;

function STEP_witchHandicapCheck() {
	//responsible for adding STEP_witchHandicap
	if (g.cycleNum == 1 && witchHandicap) {
		g.stepList.unshift(g.stepList.shift(), "witchHandicap");
	}
	return 0;
}
STEP_witchHandicapCheck.prompt_type = "auto";
STEP_witchHandicapCheck.prompt_subject = null;

function STEP_witchHandicap() {
	myMessage = "<p class='modVoice'>Since it is the first night and we are playing with a Witch team handicap, just this once I am going to show the Witches the person the Priest checked.</p>";
	if (g.lastPriestCheck == 77) {
		myMessage += "<p class='modShow'>(Shrug and shake your head to indicate that there was <u>no</u> Priest check!)</p>";
	} else {
		myMessage += "<p class='modShow'>(Point to " + pn(g.lastPriestCheck) + ".)</p>";
	}
	myMessage += "<br><p class='modVoice'>Thank you Witches, go back to sleep.</p>";
	$('#infoPrompt').html(myMessage);
	return 0;
}
STEP_witchHandicap.prompt_type = "info";
STEP_witchHandicap.prompt_subject = "Witches (Handicap)";
STEP_witchHandicap.timer = TIMER_SHORT;

function STEP_resolveNightKills() {
	for (var i = 0; i < g.playerList.length; i++) {
		if (g.playerList[i].role == 0) { //priest, handicap
			if (villageHandicap && g.cycleNum == 1)
			{
				for (var j = 0; j < 20; j++) { //unlimited protection
					g.nightProtectList.push(13*100 + i);
				}
			}
		} else if (g.playerList[i].role == 6) { //gambler
			if (g.playerList[i].choice == 0) {
				if (!(g.cycleNum % 2)) {
					g.nightProtectList.push(11*100 + i);
				}
			} else if (g.playerList[i].choice == 1) {
				if (g.cycleNum % 2) {
					g.nightProtectList.push(11*100 + i);
				}
			}
		} else if (g.playerList[i].role == 15 && g.cycleNum < 4) { //emissary
			if (g.cycleNum <= 3) {
				for (var j = 0; j < 20; j++) { //unlimited protection
					g.nightProtectList.push(12*100 + i);
				}
			}
		}
	}
	prunedProtectionList = [];
	for (var i = 0; i < g.nightProtectList.length; i++) {
		prunedProtectionList.push(g.nightProtectList[i] % 100);
	}
	for (var i = 0; i < g.nightKillList.length; i++) {
		target = g.nightKillList[i];
		if (prunedProtectionList.indexOf(target) != -1) {
			prunedProtectionList.splice(prunedProtectionList.indexOf(target), 1);
			g.nightSurvivalList.push(target);
		} else if (g.playerList[target].extraLives) {
			g.playerList[target].extraLives -= 1;
			g.nightSurvivalList.push(target);
		} else {
			kill(target);
		}
	}
	return 0;
}
STEP_resolveNightKills.prompt_type = "auto";
STEP_resolveNightKills.prompt_subject = null;

//villager win phase steps

function STEP_villageWin() {
	var myMessage = "";
	myMessage += "<p class=modVoice>Villagers Win!</p>";
	if (DEBUG) {
		myMessage += "<p class=modCode>Game Code: " + g.log + "</p>";
		console.log(g.log);
	}
	$('#winPrompt').html(myMessage);
	buildPlayerTable('#winPlayerTableBody');
	return 0;
}
STEP_villageWin.prompt_type = "win";
STEP_villageWin.prompt_subject = "Villagers Win";

//witch win phase steps

function STEP_witchWin() {
	var myMessage = "";
	myMessage += "<p class=modVoice>Witches Win!</p>";
	//myMessage += "<p class=modCode>Game Code: " + g.log + "</p>";
	console.log(g.log);
	$('#winPrompt').html(myMessage);
	buildPlayerTable('#winPlayerTableBody');
	return 0;
}
STEP_witchWin.prompt_type = "win";
STEP_witchWin.prompt_subject = "Witches Win";

//special modkill step

function STEP_modkillChoice(choice) {
	if (choice == 0) {
		g.stepList.unshift(g.stepList.shift(), "modkillQuick");
	} else if (choice == 1) {
		g.stepList.unshift(g.stepList.shift(), "modkillStandard");
	} else if (choice == 2) {
		g.stepList.unshift(g.stepList.shift(), "modkillTournament");
	} else if (choice == 3) {
		g.stepList.unshift(g.stepList.shift(), "forfeit");
	} else {
		g.stepList.unshift(g.stepList.shift(), "lynch");
	}
	return 0;
}
STEP_modkillChoice.interrupt = true;
STEP_modkillChoice.prompt_type = "choice-auto";
STEP_modkillChoice.prompt_subject = "Moderator Kill";
STEP_modkillChoice.prompt_choices = ["Quick Modkill", "Standard Modkill", "Tournament Modkill", "Team Forfeit", "Cancel"];
STEP_modkillChoice.prompt_string = "<p class='modSecret'>Should a rules violation occur (such as a player opening their eyes when they are not supposed to, or showing their cards to another player), these tools allow the moderator options for handling the situation with minimal impact to the other players.</p>";
STEP_modkillChoice.prompt_string += "<p class='modSecret'>A <b>Quick Modkill</b> is best for an innocent accident that takes place in the first couple days of the game. Regardless of the player's team, it  is slightly unfair for the Witch team.</p>";
STEP_modkillChoice.prompt_string += "<p class='modSecret'>A <b>Standard Modkill</b> is best for incidents that are more deliberate, or that take place later in the game. Regardless of the player's team, it  is slightly unfair for the Villager team.</p>";
STEP_modkillChoice.prompt_string += "<p class='modSecret'>A <b>Tournament Modkill</b> is best for a group that places fairness above all else. It is more complex than other options, but equally fair to both teams.</p>";
STEP_modkillChoice.prompt_string += "<p class='modSecret'>Finally, in especially egregious cases (such as dead players announcing information about other players to the town), there may be no alternative but to have a team <b>forfeit</b>.</p>";
STEP_modkillChoice.no_target_invalid = true;

function STEP_modkillQuick(target) {
	var myMessage = "";
	myMessage += "<p class=modVoice>Due to this accident, I unfortunately have no choice but to kill " + pn(target) + ".</p>";
	myMessage += "<p class=modVoice>The rest of the day may continue as normal, and I will allow " + pn(target) + " to still serve as an Angel or Demon to assist their team.</p>";
	$('#infoPrompt').html(myMessage);
	modkill(target, false);
	g.stepList.unshift(g.stepList.shift(), "lynch");
	return 0;
}
STEP_modkillQuick.prompt_type = "target";
STEP_modkillQuick.prompt_subject = "Quick Modkill";
STEP_modkillQuick.prompt_string = "<p class='modSecret'>A <b>Quick Modkill</b> is best for an innocent accident that takes place in the first couple days of the game. Regardless of the player's team, it  is slightly unfair for the Witch team.</p>";
STEP_modkillQuick.prompt_string += "<p class='modSecret'>The player is killed, ignoring extra lives or character abilities, and may serve as an Angel or Demon as usual. The Day Phase otherwise continues, and the town may hang a target as usual.</p>";
STEP_modkillQuick.no_target_invalid = true;

function STEP_modkillStandard(target) {
	var myMessage = "";
	myMessage += "<p class=modVoice>Due to this incident, I have no choice but to kill " + pn(target) + " and completely disqualify them from the game. They will not be allowed to act as an Angel or Demon.</p>";
	myMessage += "<p class=modVoice>This will count as the town's hanging for the Day, so we will now move on to Night.</p>";
	$('#infoPrompt').html(myMessage);
	modkill(target, true);
	return 0;
}
STEP_modkillStandard.prompt_type = "target";
STEP_modkillStandard.prompt_subject = "Standard Modkill";
STEP_modkillStandard.prompt_string = "<p class='modSecret'>A <b>Standard Modkill</b> is best for incidents that are more deliberate, or that take place later in the game. Regardless of the player's team, it is slightly unfair for the Villager team.</p>";
STEP_modkillStandard.prompt_string += "<p class='modSecret'>The player is killed, ignoring extra lives or character abilities, and may <b><i>not</i></b> serve as an Angel or Demon. This counts as the town's hanging for the Day, and the Day ends.</p>";
STEP_modkillStandard.no_target_invalid = true;


function STEP_modkillTournament(target) {
	var myMessage = "";
	myMessage += "<p class=modVoice>Due to this incident, I have no choice but to immediately disqualify " + pn(target) + " from the game. They will not be allowed to act as an Angel or Demon.</p>";
	myMessage += "<p class=modVoice>You can all appreciate that this is a delicate situation. In order to be fair to the remaining players of both teams, we are going to follow this procedure:</p>";
	myMessage += "<p class=modVoice>Rather than force the town to hang " + pn(target) + " today, I am going to allow them to kill " + pn(target) + " at any time of your choice.</p>";
	myMessage += "<p class=modVoice>In the meantime, " + pn(target) + " will be replaced by a <b>cursed totem</b> who takes no action but votes to hang themself each Day.</p>";
	myMessage += "<p class=modVoice>However, the town <i>must</i> remove this player at some point. If the town would otherwise win the game with the totem still alive, I will have no choice but to declare a Witch victory instead.</p>";
	$('#infoPrompt').html(myMessage);
	g.playerList[target].isBanned = true;
	g.stepList.unshift(g.stepList.shift(), "lynch");
	return 0;
}
STEP_modkillTournament.prompt_type = "target";
STEP_modkillTournament.prompt_subject = "Tournament Modkill";
STEP_modkillTournament.prompt_string = "<p class='modSecret'>A <b>Tournament Modkill</b> is best for a serious group that places fairness above all else. It is more complex than other options, but ensures maximal fairness to both teams.</p>";
STEP_modkillTournament.prompt_string += "<p class='modSecret'>The player is removed from the game, and may not participate in any way. Their seat in the game will be replaced with a <b>cursed totem</b>, which may still be the target of any vote or ability. The Village team must kill this faux-player to win the game, though it is up to them when to do so.</p>";
STEP_modkillTournament.prompt_string += "<p class='modSecret'>The cursed totem retains all the abilities of the removed player, but will take no action except to always vote to hang itself each day.</p>";
STEP_modkillTournament.prompt_string += "<p class='modSecret'>The Village Team <u>must</u> (eventually) kill the cursed totem to win. If they Village team would win the game with a cursed totem still alive, the Witch team lives instead.</p>";
STEP_modkillTournament.no_target_invalid = true;

function STEP_forfeit(target) {
	var myMessage = "";
	myMessage += "<p class=modVoice>Unfortunately, due to this incident, I have no choice but to require " + pn(target) + "'s team to forfeit the game.</p>";
	$('#infoPrompt').html(myMessage);
	g.forfeitFlag = g.playerList[target].team < 0 ? "witch" : "village";
	return 0;
}
STEP_forfeit.prompt_type = "target-all";
STEP_forfeit.prompt_subject = "Team Forfeit";
STEP_forfeit.prompt_string = "<p class='modSecret'>In especially egregious cases (such as dead players announcing information about other players to the town), there may be no alternative but to have a team <b>forfeit</b>.</p>";
STEP_forfeit.no_target_invalid = true;