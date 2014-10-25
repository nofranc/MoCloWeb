$(function(){
	var modules = {
		promoters: "promoModules",
		rbs: "rbsModules",
		cds: "cdsModules",
		terminators: "terminModules"
	};

	/*******************************/
	/********** Datasheet **********/
	/*******************************/

	//To - do: clicking anywhere in the part box should yield datasheet
	$(document).on("click", "#parts > * > span", function(){
		if($(this).attr("class") == "Id"){
			var partID = $(this).html();
			$.get(partID + ".txt", function(data) {
				$("#datasheet").html(data);
			});
		}
	});

	/*******************************/
	/************ Panels ***********/
	/*******************************/

	var calculateMinHeight = function(i){
		switch(i){
			case 0:
				return screen.height*0.235;
				break;
			case 1:
				return screen.height*0.15625
				break;
			case 2:
				return screen.height*0.07875
				break;
		}
	};

	var calculateMaxHeight = function(i){
		switch(i){
			case 0:
				return screen.height*0.725							
				break;
			case 1:
				return screen.height*0.65
				break;
			case 2:
				return screen.height*0.575
				break;
		}	
	};

	$("#level0Panel").resizable({handles: "n", minHeight: calculateMinHeight(0),  maxHeight: calculateMaxHeight(0)});
	$("#level1Panel").resizable({handles: "n", minHeight: calculateMinHeight(1), maxHeight:calculateMaxHeight(1)});
	$("#level2Panel").resizable({handles: "n", minHeight: calculateMinHeight(2), maxHeight:calculateMaxHeight(2)});


	/*******************************/
	/*********** Level 0 ***********/
	/*******************************/


	//When selecting a part in level 0, automatically adds to proper category in level 1
	$(document).on("click", "#parts > *", function(){
		var modulType = $(this).attr("class");
		if($(this).parent().attr("id")){
			$(this).appendTo("#" + modules[modulType] + " .modules");
		}
	});

	/***** Load All Parts *****/

	var types = ["promoters", "rbs", "cds", "terminators"];
	var partTabs = ["promTab", "rbsTab", "cdsTab", "terminTab"];
	var categ = ["promoCat", "rbsCat", "cdsCat", "terminCat"];

	$.each(types, function(index, value) { //parse each .json

		$.getJSON(value + ".json", function( data ) {
			var categories = []; //keep track of different part categories
			var allParts = [];
			$.each(data, function(i, v){ //json array
				var part = "<li class='" + value + "'>";
				$.each(v, function(key, val) { //json dict
					part += "<span class='" + key + "'>" + val + "</span><br>";

				});
				part += "</li>";

				var category = "<li class='" + categ[index] + "'>" + v["Category"] + "</li>";
				var len = categories.length;

				if (categories[len-1] !== category) categories.push(category);

				allParts.push(part);
			});
			
			$("#parts").append(allParts.join(""));
			$("#categories").append(categories.join(""));
		});	
	});

	/****** Search Functionality *****/
	var tabClicked = ""; //store ID of most recently tab clicked

	//Tab functionality
	$("#tabs > *").click(function(){
		$("#searchBar").val(""); //reset search field

		tabClicked = this.id;

		var i = partTabs.indexOf(this.id);

		var partsLi = $("#parts li");
		var categLi = $("ul#categories li");

		if(i > -1){
			$("#parts " + "." + types[i]).show();
			$("ul#categories ." + categ[i]).show();

			partsLi.not("." + types[i]).hide();
			categLi.not("." + categ[i]).hide();

		} else {
			partsLi.show();
			categLi.hide();
		}
	});

	//Filter by category
	$(document).on('click', "#categories li", function(){
		var ele = $("li:has(span.Category:contains('" + $(this).html() + "'))");
		ele.show();
		$("#parts > *").not(ele).hide();
	});

	//Live text search
	$("#searchBar").keyup(function(){
		var keyword = $(this).val();

		$("#parts li").each(function(){
			if(($(this).text().search(new RegExp(keyword, "i")) < 0))
				$(this).hide();
			else{
				if(types[partTabs.indexOf(tabClicked)] == $(this).attr("class") || 
					(tabClicked == "allTab" || tabClicked.length < 1)){
					$(this).show();
				}
			}
		});
	});

	
	/*******************************/
	/*********** Level 1 ***********/
	/*******************************/


	$(".modules").sortable({
		connectWith: ".placeholder",
		sort: function(event, ui){
			$("#parts").css('overflow','none');
		},
		receive: function(event, ui){
			ui.item.css("margin", "1%");
		}
	});


	/*******************************/
	/*********** Level 2 ***********/
	/*******************************/


	//To do: 
	//--> New network box is created once all fields of previous network box are filled
	
	//Assigns bio part to paricular div
	var categories = {
		promoters: "promoterPH",
		rbs: "rbsPH",
		cds: "cdsPH",
		terminators: "terminatorPH"
	};
	
	$(".placeholder").sortable({
		connectWith:".modules",
		over: function(event, ui){

			//!!BUG: When trying to drag any module out of placeholder, does some weird thing where slowly moves outside of placeholder - FIXED
			
			var target = $(event.target);
			var parentId = target.parent().attr("id");
			var targetClass = target.attr("class").split(' ')[0];
			var partsInTarget = $("#" + parentId + " ." + targetClass).find("li");

			
			if(parentId == categories[ui.item.attr("class").split(' ')[0]] && (target.parent().has(ui.item).length == 0)){
				//Only allow one module in each placeholder in network
				//Able to replace modules
				
				if(partsInTarget.length > 1 ){
					partsInTarget.appendTo("#" + ui.sender.parent().attr("id") + " .modules");
				}
			} 
			
		},
		receive: function(event, ui) {

			var dragged = ui.item;
			var parentBox = $(this).parent();
			var partType = dragged.attr("class").split(' ')[0];

			//Only allowed to drop corrent module types into proper placeholders
			if( parentBox.attr("id") !== categories[partType]){
				ui.sender.sortable("cancel");
			}

			
			var filled = parentBox.parent().find("li").length;
			var networks = $("#level2").children().length;

			
			if((filled/networks) == 4){
				var $level2 = $("#level2");
				var $network = $("<div class='network'>");
				var $promoterPH = $("<div id='promoterPH'>");
				var $rbsPH = $("<div id='rbsPH'>");
				var $cdsPH = $("<div id='cdsPH'>");
				var $terminatorPH = $("<div id='terminatorPH'>");

				var phTypes = {
					"P": $promoterPH, 
					"R": $rbsPH, 
					"C": $cdsPH, 
					"T": $terminatorPH
				};

				for(var ph in phTypes){
					phTypes[ph].append($("<div class='partType'>").append(ph));
					phTypes[ph].append($("<div class='placeholder'>"));
					$network.append(phTypes[ph]);
				}

				$level2.append($network);
				//have to refresh jquery to apply to new elements
				
			}

		}

	});
	
	$("#parts, #promoterPH, #rbsPH, #cdsPH, #terminatorPH").disableSelection();
});