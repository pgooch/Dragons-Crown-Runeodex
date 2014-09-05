/*
	The Virtual Rune keyboard;
*/
var carvedRunes = '';
$(document).ready(function(){

	// main keybaord area presses
	$('#keyboard .key.rune.carved').on('touchstart, click',function(){
		
		// IF the key is pressed unpress it
		if($(this).hasClass('pressed')){
			$(this).removeClass('pressed');
			carvedRunes = carvedRunes.replace($(this).text(),'');

		// otherwise if your not at the limit add it
		}else if(carvedRunes.length<2){
			$(this).addClass('pressed');
			carvedRunes += $(this).text();
		
		}

		window.location.hash = carvedRunes;

		findSpell(carvedRunes);

	});

	// The info "rune"
	$('#keyboard .key.alt.info').on('touchstart, click',function(){
		window.location.hash = 'info';
		clearResults();
		drawInfo();
		// and reset the runes
		carvedRunes='';
		$('#keyboard .key.pressed').removeClass('pressed');
	});

	// The clear "rune"
	$('#keyboard .key.alt.clear').on('touchstart, click',function(){
		window.location.hash = '';
		carvedRunes='';
		$('#keyboard .key.pressed').removeClass('pressed');
		findSpell(carvedRunes);
	});
});

/*
	To prevent the back button from just killing off what your doing were going to bind to it
*/
$(window).bind('hashchange',function(e){
	if(window.location.hash==''){
		clearResults();
		drawWelcome();
	}else if(window.location.hash=='#info'){
		// Do nothing, at least for now
	}else{
		clearResults();
		findSpell(window.location.hash.replace('#',''));
	}
});


/*
	Main logic, called by doing various things
*/
var haveRunes = 'DEMRST';// All the runes you can get
function findSpell(carvedRunes){

	// If there are no carvedRunes selected we can return to the welcome page
	if(carvedRunes.length==0){
		clearResults();
		drawWelcome();
	
	// We have some carved runes, so lets get to work
	}else{

		// Just in case we get no results...
		var foundSpell = false;

		// Lets take a look at all the runes, see which ones meet the criteria
		$.each(runeSpells,function(spell,details){

			// We are going to overwrite certian characters in the spell to keep track of what we have and haven't accounted for, but we still want that spell intact for getting the details later
			var spellCheck = spell;

			// Keep track of the number of characters we have found, need 3 to cast
			var foundCharacters = 0;

			// Loop through all the runes you have selected
			for(i=carvedRunes.length;i>0;i--){

				// see if we can find a carved character
				var check = spellCheck.match('['+carvedRunes[i-1]+']');
				if(check!=null){

					// We found it, thats good, remove it from the list so we don't hit it again
					spellCheck = spellCheck.slice(0,check.index)+'/'+spellCheck.slice(check.index+1);

					// And note we found a character
					foundCharacters++;

				}
			}

			// If we found at least a single character then check against the rune stones on hand
			if(foundCharacters>0){


				// Loop through the on hand stones
				for(i=haveRunes.length;i>0;i--){

					// check if the rune is found in a stone we have
					check = spellCheck.match('['+haveRunes[i-1]+']');
					if(check!=null){

						// Remove that stone from the spell
						spellCheck = spellCheck.slice(0,check.index)+'/'+spellCheck.slice(check.index+1);

						// And note we found a character
						foundCharacters++;

					}
				}
			}

			// If the spellCheck is '///' (we have all runes accounted for) and we have at least 3 tunes (just in case something goes awry), then drawSpell
			if(spellCheck=='///' && foundCharacters >= 3){
				if(foundSpell==false){
					clearResults();
					foundSpell=true;
				}
				drawSpell(spell,carvedRunes);
			}
		});

		// If we didn't find anything update a message with as much
		if(foundSpell==false){
			clearResults();
			drawNoResults(carvedRunes);
		}
	}
}

/*
	Draws spells found by the fileSpell function to the results box
*/
function drawSpell(spell,carvedRunes){

	// Split up the carved runes and copy of the spell to keep track up needed stones
	carvedRunes = carvedRunes.split('');
	neededStones = spell;

	// generate the html to append
	var html  = '<tr class="spell '+(runeSpells[spell].missionReleated==true?'mission':'')+'">';
		html += '<td class="needed-runes">';
			$.each(carvedRunes,function(n,rune){
				if(spell.match(rune)){
					html += '<span class="rune carved '+rune+'"></span>';
					neededStones = neededStones.replace(rune,'');
				}
			});
			neededStones = neededStones.split('');
			$.each(neededStones,function(n,rune){
				html += '<span class="rune stone '+rune+'"></span>';
			});
		html += '</td>';
		html += '<td class="spell-details">';
			html += '<b>'+runeSpells[spell].name+'</b>';
			html += '<i>'+runeSpells[spell].description+'</i>';
		html += '</td>';
	html += '</tr>';
	$('#results').append(html);
}


/*
	These functions "Draw" items, but really there just toggling the view of hidden items
*/
function drawWelcome(){
	$('#results tr.welcome').show();
}
function drawNoResults(carvedRunes){
	carvedRunes = carvedRunes.split('');
	var html = '';
	$.each(carvedRunes,function(n,rune){
		html += '<span class="rune carved '+rune+'"></span>';
	});
	$('#results tr.no-results .selected-runes').html(html);
	$('#results tr.no-results').show();
}
function drawInfo(num){
	if(num==undefined){
		var num = Math.floor(Math.random()*6);
	}
	$('#results tr.info .character').removeClass('amazon dwarf elf fighter sorceress wizard');
	var characters = ['amazon','dwarf','elf','fighter','sorceress','wizard'];
	$('#results tr.info .character').addClass(characters[num]).attr('data-char_num',num);
	$('#results tr.info').show();
}

/*
	Pointless JS, click/tap the character in the info page to change it to the next one
*/
$('html').on('touchstart, click','#results tr.info .character',function(){
	var num = $(this).attr('data-char_num');
	num++
	if(num>5){
		num=0;
	}
	drawInfo(num);
});

/*
	Simply clears the search results, removes spells and hides the set messages
*/
function clearResults(){
	$('#results tr.spell').remove();
	$('#results tr').hide();
}

/*
	The help/info popup
*/
function questionRune(){
	alert('Runes do not have to be clicked in order. Finder assume you have all runes (that might change). Void where prohibited and Canada.');
}

/*
	All the possible rune combinations
*/
var runeSpells = {
	'SOD' : {
		'name' : 'Sigil Of Death',
		'description' : 'Casts a spell with high chance of killing enemies in range',
		'missionReleated' : false
	},
	'TEB' : {
		'name' : 'Tri-Elemental Blast',
		'description' : 'Casts a fire, ice, and lightning area-of-effect spell',
		'missionReleated' : false
	},
	'DBG' : {
		'name' : 'Dead Be Gone',
		'description' : 'Kills undead enemies',
		'missionReleated' : false
	},
	'PTF' : {
		'name' : 'Petrify The Flesh',
		'description' : 'Petrify enemies',
		'missionReleated' : false
	},
	'PAD' : {
		'name' : 'Potency And Durability',
		'description' : 'Buffs attack and defense',
		'missionReleated' : false
	},
	'TTF' : {
		'name' : 'The True Fist',
		'description' : 'Buffs the damage done by bare handed attacks',
		'missionReleated' : false
	},
	'SBS' : {
		'name' : 'Strength Beyond Strength',
		'description' : 'Grants invulnerability',
		'missionReleated' : false
	},
	'CSW' : {
		'name' : 'Call Sylphide\'s Wind',
		'description' : 'Casts a spell which shields players in wind',
		'missionReleated' : false
	},
	'SOL' : {
		'name' : 'Salve Of Life',
		'description' : 'Casts a healing circle on the ground',
		'missionReleated' : false
	},
	'DSB' : {
		'name' : 'Double Score Bonus',
		'description' : 'Doubles all points earned',
		'missionReleated' : false
	},
	'GWS' : {
		'name' : 'Generate Weapon Stash',
		'description' : 'Spawns a crate of temporary weapons',
		'missionReleated' : false
	},
	'EIS' : {
		'name' : 'Extra Item Stock',
		'description' : 'Grants one additional use to all consumable items',
		'missionReleated' : false
	},
	'TPI' : {
		'name' : 'The Phoenix Incantation',
		'description' : 'Grants all players an extra life point',
		'missionReleated' : false
	},
	'TSK' : {
		'name' : 'The Skeleton Key',
		'description' : 'Opens hidden doors',
		'missionReleated' : false
	},
	'THF' : {
		'name' : 'Treasure Hunter\'s Friend',
		'description' : 'Uncovers hidden treasure',
		'missionReleated' : false
	},
	'ECG' : {
		'name' : 'Enchanted Coin Geyser',
		'description' : 'Spawns a random amount of money',
		'missionReleated' : false
	},
	'OTS' : {
		'name' : 'Open The Sesame',
		'description' : 'Opens hidden doors',
		'missionReleated' : false
	},	
	'LFS' : {
		'name' : 'Life From Stone',
		'description' : 'Brings statues to life',
		'missionReleated' : true
	},
	'SFC' : {
		'name' : 'Solomon\'s Flying Carpet',
		'description' : 'Spawns a flying carpet',
		'missionReleated' : true
	},
	'DIE' : {
		'name' : 'DIE',
		'description' : 'Where all living things go',
		'missionReleated' : true
	},
	'RMZ' : {
		'name' : 'Reveal Mystery Zone',
		'description' : 'Used to gain access to illusionary lands',
		'missionReleated' : true
	},
};

/*
	Zoom-if-ier
	A Terrible way to make it all work but I'm ok with a hack all things considered, will adjust page zoom so that a specified height will always be visible, basically I'm forcing it to work when the height is to small because having both a portrait and landscape view seems excessive given the scope of the app.
*/
var neededHeight = 625;
$(window).on('resize',zoomIfIer);
$(document).ready(zoomIfIer)
function zoomIfIer(){
	actualHeight = $(window).height();
	if(actualHeight<neededHeight){
		$('body').css('zoom',actualHeight/neededHeight);
	}else{
		$('body').css('zoom',1);
	}
}

/*
	Trying to fix that "it wont work if it's relative" web app icon bug
*/
// /$('link[rel="apple-touch-icon"]').attr('href',window.location+$('link[rel="apple-touch-icon"]').attr('href'));
// /$('link[rel="shortcut-icon"]').attr('href',window.location+$('link[rel="shortcut-icon"]').attr('href'));
// /$('link[rel="shortcut icon"]').attr('href',window.location+$('link[rel="shortcut icon"]').attr('href'));
//	    <link rel="apple-touch-icon" href="img/icon.png"/>
//	    <link rel="shortcut icon" href="img/icon.png">
//