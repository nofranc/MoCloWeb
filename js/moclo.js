$(function(){
	var modules = {
		promoters: "promoModules",
		rbs: "rbsModules",
		cds: "cdsModules",
		terminators: "terminModules"
	};

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

	//List all parts by category
	var types = ["promoters", "rbs", "cds", "terminators"];
	var listTypes = ["promTab", "rbsTab", "cdsTab", "terminTab"];

	$.each(types, function(index, value) { //parse each .json

		$.getJSON(value + ".json", function( data ) {
			var allParts = [];
			$.each(data, function(i, v){ //json array
				var part = "<li class='" + value + "'>";
				$.each(v, function(key, val) { //json dict
					part += "<span class='" + key + "'>" + val + "</span><br>";

				});
				part += "</li>";
				allParts.push(part);
			});
			
			$("#parts").append(allParts.join(""));
			
		});	

	});

	//Tab functionality
	$("#tabs > *").click(function(){
		var i = listTypes.indexOf(this.id);

		if(i > -1){
			$("#parts " + "." + types[i]).show();
			$("#parts li").not("." + types[i]).hide();
		} else {
			$("#parts li").show();
		}
	});

	//load info for datasheet
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