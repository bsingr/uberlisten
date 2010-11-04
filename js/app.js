(function($) {
	
  var app = $.sammy('#container', function(app) {
    app.use('Couch');

	Note = app.createModel("note");
	
	var reloadList = function(){
	  jQuery("#list").html("<li>Loading...</li>");
	  var ulHtml = "";
	  Note.all(function(notes){
		$.each(notes.rows, function(i,row){
		  if (row.doc.type == "note") {
			ulHtml += "<li><a href='#!/notes/"+row.id+"/delete' data-id='"+row.id+"' data-rev='"+row.doc._rev+"'>"+row.doc.text+"</a></li>";
		  }
		});
		jQuery("#list").html(ulHtml);
	  });
	};

    app.get("#!/", function(){
	  reloadList();
    });

    app.post("#!/notes", function(){
	  var con = this;
	  var text = this.params["text"];
	  Note.create({
		"text": text
	  },function(c){
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
