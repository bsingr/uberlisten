(function($) {
	
  var app = $.sammy('#container', function(app) {
    app.use('Couch');

	Note = app.createModel("note");
	
	var updateForm = function(method, $note){
	  	$("form").attr("method", method);
		if (method == "put") {
			$("[name=text]").val($note.attr("data-text")).select();
			$("[name=id]").val($note.find("a").attr("data-id"));
		}
	};
	
	var reloadList = function(){
	  $("#notes").html("<li>Loading...</li>");
	  var ulHtml = "";
	  Note.all(function(notes){
		var count = 0;
		$.each(notes.rows, function(i,row){
		  if (row.doc.type == "note") {
			count++;
			ulHtml += "<li data-text='"+row.doc.text+"' data-id='"+row.id+"' data-rev='"+row.doc._rev+"'>";
			ulHtml += row.doc.text;
			ulHtml += " <a href='#!/notes/"+row.id+"/delete' data-id='"+row.id+"' data-rev='"+row.doc._rev+"'>";
			ulHtml += "&spades; delete</a></li>";
		  }
		});
		$("#notes").html(ulHtml);
		if (count > 1) { $(".notes-actions").fadeIn(300); }
		else { $(".notes-actions").fadeOut(300); }
	  });
	};
	
	app.bind("run", function(){
	  $("#notes").delegate("li", "click", function(e){
		updateForm("post");
		if ($(e.target).is("li")) {
		  updateForm("put", $(this));
		}
	  });
	});

    app.get("#!/", function(){
	  reloadList();
    });

    app.put("#!/notes", function(){
	  var con = this;
	  var text = this.params["text"];
	  var isValid = (text != "");
	  if (!isValid) { $("[name=text]").css("background","#ffcccc"); return false; }
	  else { $("[name=text]").css("background","white").val(""); }
	  Note.update(this.params.id, {
		"text": text
	  }, function(c){
		con.redirect("#!/");
	  }); 
    });

    app.post("#!/notes", function(){
	  var con = this;
	  var text = this.params["text"];
	  var isValid = (text != "");
	  if (!isValid) { $("[name=text]").css("background","#ffcccc"); return false; }
	  else { $("[name=text]").css("background","white").val(""); }
	  Note.create({
		"text": text
	  }, function(c){
		con.redirect("#!/");
	  }); 
    });

    app.get("#!/notes/:id/delete", function(con){  
      var doc = {
		_id: this.params.id,
		_rev: $("[data-id='"+this.params.id+"']").attr("data-rev")
	  };
	  $("#notes").find("li[data-id="+this.params.id+"]").remove();
	  app.db.removeDoc(doc, {
		success: function(){
		  $("body").append("<div id='msg'>Note deleted!</div>").find("#msg").fadeOut(1000, function(){$(this).remove()});
		}
	  });
      con.redirect("#!/");
    });

    app.get("#!/notes/delete", function(con){
	  var docs = $("#notes").find("li").map(function(){
		return {_id: $(this).attr("data-id"), _rev: $(this).attr("data-rev")};
	  }).get();
	  $("#notes").empty();
	  app.db.bulkRemove({docs: docs}, {
	    success: function(){
		  $("body").append("<div id='msg'>All notes deleted!</div>").find("#msg").fadeOut(1500, function(){$(this).remove()});
		}
	  });
	  con.redirect("#!/");
	});

  });

  $(function() {
    app.run("#!/");
  });

})($);
