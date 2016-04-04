function get_filename() {
    var path_array = window.location.pathname.split("/")
    return path_array[path_array.length - 1]
}

function update_xmldb(element, e) {
            var data = {};
            data['shift'] = e.shiftKey
            data['value'] = $(element).text();
            data['id'] = element.id;
            doc = $('.ocr_page').attr('title')
            data['doc'] = doc
            var n = doc.lastIndexOf('/');
            var fileName = doc.substring(n + 1);
            data['fileName'] = fileName
            var filePath = doc.substring(0,n);
            data['filePath'] = filePath
            $.post('http://heml.mta.ca:8080/exist/apps/laceApp/updateWord.xq',data)
}

function update_all_xmldb(element, e) {
            var data = {};
            data['correctedForm'] = $(element).text();
            data['query'] = $(element).attr('data-selected-form');
            doc = $('.ocr_page').attr('title')
            data['doc'] = doc
            var n = doc.lastIndexOf('/');
            var collectionPath = doc.substring(0,n);
            data['collectionPath'] = collectionPath
            //alert("would have updated " + data['query'] + " with " + data['correctedForm'] + " in all of " + data['collectionPath']);
            $.post('http://heml.mta.ca:8080/exist/apps/laceApp/updateMany.xq',data)
}

function add_line_below_xmldb(element, e,uniq) {
            var data = {};
            data['shift'] = e.shiftKey
            data['value'] = $(element).text();
            data['id'] = element.id;
            data['uniq'] = uniq;
            doc = $('.ocr_page').attr('title')
            data['doc'] = doc
            var n = doc.lastIndexOf('/');
            var fileName = doc.substring(n + 1);
            data['fileName'] = fileName
            var filePath = doc.substring(0,n);
            data['filePath'] = filePath
            $.post('http://heml.mta.ca:8080/exist/apps/laceApp/addLineBelow.xq',data)
}

function generate_image_tag_call(book_name, page_file, bbox) {
	var request = "<img src=\"/secretlace/image_test?book=" + encodeURIComponent(book_name) + "&amp;file=" + encodeURIComponent(page_file) + "&amp;bbox=" + encodeURIComponent(bbox) + "\" alt='a word image'/>"
	return request
}

$(function() {
    $('.ocr_word').tipsy({
        gravity: 'n' ,
        trigger: 'manual',
        title: function() 
/**/
              { var prev_bbox = ""; 
                var page_path = $(this).closest('.ocr_page').attr("title");
                var bbox = $(this).attr('original-title');
                if($(this).is(':last-child') && $(this).prev().length)
		{
    		prev_bbox = $(this).prev().attr('original-title')
                prev_end = prev_bbox.split(" ")[3]
                bbox_array = bbox.split(" ")
                bbox_array[1] = prev_end
                bbox = bbox_array.join(" ")
		}
                            var path_array = page_path.split('/');
                            var page_file = path_array[path_array.length - 1];
                            var book_name = path_array[0];
                            return generate_image_tag_call(book_name, page_file, bbox)},//book_name.concat(" ",page_file," ",bbox)},
/**/
        //{return "<img src='/secretlace/image_test' alt='foo'/>"; },
        //'<img src="/secretlace/image_test" alt="foo"/>',
        html: true
    });
    $('.ocr_word').focus(function(){$(this).tipsy("show")});
    $('.ocr_word').focusout(function(){$(this).tipsy("hide")});
    $('.ocr_word').bind('keydown', function(e) {
        if (e.which == 110) {
           e.preventDefault();
           alert("combo");
        }
    });


    $('.inserted_line').bind('keypress', function(e) {
        if (e.which == 13) {
           e.preventDefault();
           update_xmldb(this, e);
           $(this).attr("data-manually-confirmed", "true");
        }
    });
    $('.ocr_word').bind('keypress', function(e) { 
        if (e.which == 13) {
         e.preventDefault();
          if (e.shiftKey == false) {
            var data = {};
            console.log(this.constructor.name);
            if(e.ctrlKey == true) {//with ctrl held down, every word in all volume page is
            //corrected at once
               update_all_xmldb(this,e);
               old_form = $(this).attr('data-selected-form')
               new_form = $(this).text()
               $(".ocr_word[data-selected-form='" + old_form.replace(/'/g, "\\'") + "']").each(function(){
                  $(this).text(new_form);
                  $(this).attr("data-manually-confirmed", "true");
               });
             }
            else {
               update_xmldb(this, e);
            }
            /*alert($(this).text());
	    data['value'] = $(this).text();
            data['id'] = this.id;
            doc = $('.ocr_page').attr('title')
            data['doc'] = doc
            $.post('http://heml.mta.ca:8080/exist/apps/laceApp/updateWord.xq',data)
*/
            $(this).attr("data-manually-confirmed", "true");
            var focusables = $(".ocr_word");
            var current = focusables.index(this);
            var path_array = window.location.pathname.split("/")
            next = focusables.eq(current + 1).length ? focusables.eq(current + 1) : focusables.eq(0);
/* Not certain this functionality is desired. It rapidly verifies a whole bunch of following words, but I thinnk
   it ends up validating to liberally in practice.
            if (e.shiftKey == true) {
              //First, make sure we don't get into endless loop when all are edited. Next only rip through the ones that are True,
              //Edited (Manual) or TrueLower
              while (focusables.index(next) != 0 && ($(next).attr("data-spellcheck-mode") === "True" || $(next).attr("data-manually-confirmed") === "true" || $(next).attr("data-spellcheck-mode") === "TrueLower")){
                update_xmldb(next);
                console.log(next.constructor.name);
                console.log(next);
                $(next).attr("data-manually-confirmed", "true");
                next_index = focusables.index(next);
		alert(next_index);
                next = focusables.eq(next_index + 1).length ? focusables.eq(next_index + 1) : focusables.eq(0);
                }
            }
*/
            next.focus()
            var all_manually_edited = true;
            $(".ocr_word").each(function(index, element) {
                if (($(element).attr("data-spellcheck-mode") !== "Manual") && ($(element).attr("data-manually-confirmed") !== "true")) {
                    all_manually_edited = false;
                }
            });
            if (all_manually_edited) {
                $('#download').attr('style', "display: block;");
            }
            var name = get_filename();
            $('#download').attr('download', name);
            }//end shiftkey = false
            else { // shiftkey is true
             if (e.shiftKey == true) {
               var uniq = 'ins_line_' + (new Date()).getTime();
               var newline = $( "<span class='inserted_line' id='" + uniq + "' data-manually-confirmed='false' contenteditable='true'/>" )
               $(this).parent('.ocr_line').after(newline);
               add_line_below_xmldb(this,e,uniq);
               $('.ocr_page').on('keypress', '.inserted_line', function(e) {
        if (e.which == 13) {
           e.preventDefault();
           update_xmldb(this, e);
           $(this).attr("data-manually-confirmed", "true");
        }
    });
               newline.focus()
             }
            }//end else
           }//end if e.which == 13
            });
});