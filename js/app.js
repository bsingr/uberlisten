(function($) {
	
  var app = $.sammy('#container', function(app) {
    app.use('Couch');

	Note = app.createModel("note");
	
	var reloadList = function(){
	  jQuery("#notes").html("<li>Loading...</li>");
	  var ulHtml = "";
	  Note.all(function(notes){
		$.each(notes.rows, function(i,row){
		  if (row.doc.type == "note") {
			ulHtml += "<li data-text='"+row.doc.text+"'>"+row.doc.text+" <a href='#!/notes/"+row.id+"/delete' data-id='"+row.id+"' data-rev='"+row.doc._rev+"'>(delete)</a></li>";
		  }
		});
		jQuery("#notes").html(ulHtml);
	  });
	};
	
	app.bind("run", function(){
	  jQuery("#notes").delegate("li", "click", function(){
		jQuery("[name=text]").val(jQuery(this).attr("data-text")).select();
		jQuery("[name=id]").val(jQuery(this).find("a").attr("data-id"));
		jQuery("form").attr("method", "put");
	  });
	});

    app.get("#!/", function(){
	  reloadList();
    });

    app.put("#!/notes", function(){
	  var con = this;
	  var text = this.params["text"];
	  var isValid = (text != "");
	  if (!isValid) { jQuery("[name=text]").css("background","#ffcccc"); return false; }
	  else { jQuery("[name=text]").css("background","white").val(""); }
	  Note.update(this.params.id, {
		"text": text
	  }, function(c){
		jQuery("form").attr("method", "post");
		con.redirect("#!/");
	  }); 
    });

    app.post("#!/notes", function(){
	  var con = this;
	  var text = this.params["text"];
	  var isValid = (text != "");
	  if (!isValid) { jQuery("[name=text]").css("background","#ffcccc"); return false; }
	  else { jQuery("[name=text]").css("background","white").val(""); }
	  Note.create({
		"text": text
	  }, function(c){
		con.redirect("#!/");
	  }); 
    });

    app.get("#!/notes/:id/delete", function(){
	  var con = this;
	  if (window.confirm("Delete?")) {	  
		  var doc = {
			_id: this.params.id,
			_rev: jQuery("[data-id='"+this.params.id+"']").attr("data-rev")
		  };
		  app.db.removeDoc(doc);
      }
      con.redirect("#!/");
    });

  });

  $(function() {
    app.run("#!/");
  });

})(jQuery);
