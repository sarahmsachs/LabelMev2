// Created: 04/13/2006
// Updated: 04/13/2006

// file_info class
// Keeps track of the information for the currently displayed image
// and fetches the information via dirlists or from the URL.
function file_info() {
    
    // *******************************************
    // Private variables:
    // *******************************************
    
    this.page_in_use = 0; // Describes if we already see an image.
    this.dir_name = null;
    this.im_name = null;
    //added mov_name to support video mode 12.12.06 jmejia
    this.mov_name = null;
    this.collection = 'LabelMe';
    this.mode = 'i'; //initialize to picture mode
    this.hitId = null;
    this.assignmentId = null;
    this.workerId = null;
    this.mt_instructions = null;
    
    // *******************************************
    // Public methods:
    // *******************************************
    
    // Parses the URL and gets the collection, directory, and filename
    // information of the image to be annotated.  Returns true if the
    // URL has collection, directory, and filename information.
    this.ParseURL = function () {
        var labelme_url = document.URL;
        var idx = labelme_url.indexOf('?');
        if((idx != -1) && (this.page_in_use == 0)) {
            this.page_in_use = 1;
            var par_str = labelme_url.substring(idx+1,labelme_url.length);
            var isMT = true; // In MT mode?
            var default_view_ObjList = false;
            do {
                idx = par_str.indexOf('&');
                var par_tag;
                if(idx == -1) par_tag = par_str;
                else par_tag = par_str.substring(0,idx);
                var par_field = this.GetURLField(par_tag);
                var par_value = this.GetURLValue(par_tag);
                if(par_field=='movie'){
                    this.mov_name = par_value;
                }
                if(par_field=='mode'){
                    this.mode = par_value;
                    if(this.mode=='im' || this.mode=='mt') view_ObjList = false;
                    if(this.mode=='mt') isMT = true;
                }
                if(par_field=='username') {
                    username = par_value;
                }
                if(par_field=='collection') {
                    this.collection = par_value;
                }
                if(par_field=='folder') {
                    console.log(par_value);
			this.dir_name = par_value;
                }
                if(par_field=='image') {
                    this.im_name = par_value;
                    if(this.im_name.indexOf('.jpg')==-1 && this.im_name.indexOf('.png')==-1) {
                        this.im_name = this.im_name + '.jpg';
                    }
                }
                if(par_field=='hitId') {
                    this.hitId = par_value;
                    isMT = true;
                }
                if(par_field=='turkSubmitTo') {
                    isMT = true;
                }
                if(par_field=='assignmentId') {
                    this.assignmentId = par_value;
                    isMT = true;
                }
                if((par_field=='mt_sandbox') && (par_value=='true')) {
                    externalSubmitURL = externalSubmitURLsandbox;
                }
                if(par_field=='N') {
                    mt_N = par_value;
                }
                if(par_field=='workerId') {
                    this.workerId = par_value;
                    isMT = true;
                    
                    // Get second-half of workerId:
                    var len = Math.round(this.workerId.length/2);
                    username = 'MT_' + this.workerId.substring(len-1,this.workerId.length);
                }
                if(par_field=='mt_intro') {
                    MThelpPage = par_value;
                }
                if(par_field=='actions') {
                    // Get allowable actions:
                    var actions = par_value;
                    action_CreatePolygon = 0;
                    action_RenameExistingObjects = 0;
                    action_ModifyControlExistingObjects = 0;
                    action_DeleteExistingObjects = 0;
                    if(actions.indexOf('n')!=-1) action_CreatePolygon = 1;
                    if(actions.indexOf('r')!=-1) action_RenameExistingObjects = 1;
                    if(actions.indexOf('m')!=-1) action_ModifyControlExistingObjects = 1;
                    if(actions.indexOf('d')!=-1) action_DeleteExistingObjects = 1;
                    if(actions.indexOf('a')!=-1) {
                        action_CreatePolygon = 1;
                        action_RenameExistingObjects = 1;
                        action_ModifyControlExistingObjects = 1;
                        action_DeleteExistingObjects = 1;
                    }
                    if(actions.indexOf('v')!=-1) {
                        action_CreatePolygon = 0;
                        action_RenameExistingObjects = 0;
                        action_ModifyControlExistingObjects = 0;
                        action_DeleteExistingObjects = 0;
                    }
                }
                if(par_field=='viewobj') {
                    // Get option for which polygons to see:
                    var viewobj = par_value;
                    view_Existing = 0;
                    view_Deleted = 0;
                    if(viewobj.indexOf('e')!=-1) view_Existing = 1;
                    if(viewobj.indexOf('d')!=-1) view_Deleted = 1;
                    if(viewobj.indexOf('a')!=-1) {
                        view_Deleted = 1;
                        view_Existing = 1;
                    }
                }
                if(par_field=='objlist') {
                    if(par_value=='visible') {
                        view_ObjList = true;
                        default_view_ObjList = true;
                    }
                    if(par_value=='hidden') {
                        view_ObjList = false;
                        default_view_ObjList = false;
                    }
                }
                if(par_field=='mt_instructions') {
                    // One line MT instructions:
                    this.mt_instructions = par_value;
                    this.mt_instructions = this.mt_instructions.replace(/_/g,' ');
                }
                if(par_field=='objects') {
                    // Set drop-down list of object to label:
                    object_choices = par_value.replace('_',' ');
                    object_choices = object_choices.split(/,/);
                }
                if((par_field=='scribble')&&(par_value=='true')) {
		  scribble_mode = true;
		}
                par_str = par_str.substring(idx+1,par_str.length);
            } while(idx != -1);
            if((!this.dir_name) || (!this.im_name)) return this.SetURL(labelme_url);
            
            if(isMT) {
                this.mode='mt'; // Ensure that we are in MT mode
                view_ObjList = default_view_ObjList;
            }
            
            if((this.mode=='i') || (this.mode=='v') || (this.mode=='c') || (this.mode=='f')) {
                document.getElementById('body').style.visibility = 'visible';
            }
            else if((this.mode=='im') || (this.mode=='mt')) {
                var p = document.getElementById('header');
                p.parentNode.removeChild(p);
                //var p = document.getElementById('username_main_div');
                //p.parentNode.removeChild(p);
                //var p = document.getElementById('counter_div');
                //p.parentNode.removeChild(p);
                //I ERASED THE NEXT PART BC I LIKE THE BUTTONS
                //var p = document.getElementById('tool_buttons');
                //p.parentNode.removeChild(p);
                document.getElementById('body').style.visibility = 'visible';
            }
            else {
                this.mode = 'i';
                document.getElementById('body').style.visibility = 'visible';
            }
            
            if(!view_ObjList) {
                var p = document.getElementById('anno_anchor');
                p.parentNode.removeChild(p);
            }
            
            if(this.assignmentId=='ASSIGNMENT_ID_NOT_AVAILABLE') {
                window.location = MThelpPage;
                return false;
            }
            if(this.mode=='mt') {
                if(!this.mt_instructions) {
                    if(mt_N=='inf') this.mt_instructions = 'Draw a polygon around the part of the image that most indicates which decade it was taken in. <br /> Then, you will be asked what decade you think the image was taken in.';
                    else if(mt_N==1) this.mt_instructions = 'Draw a polygon around the part of the image that most indicates which decade it was taken in. <br /> Then, you will be asked what decade you think the image was taken in.';
                    else this.mt_instructions = 'Please label the aspect of this image that is most indicative of the decade you think it was taken in.';
                }
                if(mt_N=='inf') mt_N = 1;
                
                var html_str = '<table><tr><td><font size="4"><b>' + this.mt_instructions + '  Scroll down to see the entire image. &#160;&#160;&#160; </b></font></td><td><form action="' + externalSubmitURL + '"><input type="hidden" id="assignmentId" name="assignmentId" value="'+ this.assignmentId +'" /><input type="hidden" id="number_objects" name="number_objects" value="" /><input type="hidden" id="object_name" name="object_name" value="" /><input type="hidden" id="LMurl" name="LMurl" value="" /><input type="hidden" id="mt_comments" name="mt_comments" value="" /><input disabled="true" type="submit" id="mt_submit" name="Submit" value="Submit HIT" onmousedown="javascript:document.getElementById(\'mt_comments\').value=document.getElementById(\'mt_comments_textbox\').value;" /></form></td></tr></table>';
                
		$('#mt_submit_form').append(html_str);
                
                var html_str2 = '<font size="4"><b>Scroll up to see the entire image</b></font>&#160;&#160;&#160;<font size="3">(Optional) Do you wish to provide any feedback on this HIT?</font><br /><textarea id="mt_comments_textbox" name="mt_comments_texbox" cols="94" nrows="5" />';
		$('#mt_feedback').append(html_str2);
                
                if(global_count >= mt_N) document.getElementById('mt_submit').disabled=false;
            }
        }
        else {
            return this.SetURL(labelme_url);
        }
        
        
        return 1;
    };
    
    //get video or picture mode 12.12.06 jmejia
    this.GetMode = function() {
        return this.mode;
    };
    
    this.GetCollection = function () {
        return this.collection;
    };
    
    this.GetDirName = function () {
        return this.dir_name;
    };
    
    this.GetImName = function () {
        return this.im_name;
    };
    
    this.SetImName = function (newImName){
        this.im_name = newImName;
    };
    
    //get the movie name 12.12.06 jmejia
    this.GetMovName = function () {
        return this.mov_name;
    };
    
    //change to support video mode
    this.GetImagePath = function () {
        if((this.mode=='i') || (this.mode=='c') || (this.mode=='f') || (this.mode=='im') || (this.mode=='mt')) return 'Images/' + this.dir_name + '/' + this.im_name;
        if(this.mode == 'v') return 'Video/Frames/' + this.dir_name + '/' + this.mov_name + '/' + this.im_name;
    };
    
    this.GetAnnotationPath = function () {
        if((this.mode=='i') || (this.mode=='c') || (this.mode=='f') || (this.mode=='im') || (this.mode=='mt')) return 'Annotations/' + this.dir_name + '/' + this.im_name.substr(0,this.im_name.length-4) + '.xml';
        if(this.mode =='v') return 'Video/Annotations/' + this.dir_name + '/' + this.mov_name + '.xml';
    };
    
    this.GetFullName = function () {
        if((this.mode=='i') || (this.mode=='c') || (this.mode=='f') || (this.mode=='im') || (this.mode=='mt')) return this.dir_name + '/' + this.im_name;
        if(this.mode == 'v') return this.dir_name + '/' + this.mov_name;
    };
    
    this.GetTemplatePath = function () {
        if(!this.dir_name) return 'annotationCache/XMLTemplates/labelme.xml';
        return 'annotationCache/XMLTemplates/' + this.dir_name + '.xml';
    };
    
    // *******************************************
    // Private methods:
    // *******************************************
    
    // String is assumed to have field=value form.  Parses string to
    // return the field.
    this.GetURLField = function (str) {
        var idx = str.indexOf('=');
        return str.substring(0,idx);
    };
    
    // String is assumed to have field=value form.  Parses string to
    // return the value.
    this.GetURLValue = function (str) {
        var idx = str.indexOf('=');
        return str.substring(idx+1,str.length);
    };
    
    // Changes current URL to include collection, directory, and image
    // name information.  Returns false.
    this.SetURL = function (url) {
        this.FetchImage();
        
        var idx = url.indexOf('?');
        var tail = '';
        if(idx != -1) {
            tail = url.substring(idx+1,url.length);
            url = url.substring(0,idx);
        }
        
        // Include username in URL:
        var extra_field = '';
        if(username != 'anonymous') extra_field = '&username=' + username;
        
        if(this.mode=='i') window.location = url + '?collection=' + this.collection + '&mode=' + this.mode + '&folder=' + this.dir_name + '&image=' + this.im_name + extra_field;
        else if(this.mode=='im') window.location = url + '?collection=' + this.collection + '&mode=' + this.mode + '&folder=' + this.dir_name + '&image=' + this.im_name + extra_field;
        else if(this.mode=='mt') window.location = url + '?collection=' + this.collection + '&mode=' + this.mode + '&folder=' + this.dir_name + '&image=' + this.im_name + extra_field;
        else if(this.mode=='c') window.location = url + '?mode=' + this.mode + '&username=' + username + '&collection=' + this.collection + '&folder=' + this.dir_name + '&image=' + this.im_name + extra_field;
        else if(this.mode=='f') window.location = url + '?mode=' + this.mode + '&folder=' + this.dir_name + '&image=' + this.im_name + extra_field;
        return false;
    };
    
    // Fetch next image.
    this.FetchImage = function () {
        //var url = 'annotationTools/perl/fetch_image.cgi?mode=' + this.mode + '&username=' + username + '&collection=' + this.collection.toLowerCase() + '&folder=' + this.dir_name + '&image=' + this.im_name;
        var url = 'annotationTools/perl/fetch_image.cgi?mode=' + this.mode + '&collection=' + this.collection.toLowerCase() + '&folder=' + this.dir_name + '&image=' + this.im_name;
        //var url = 'annotationTools/perl/fetch_image.cgi?mode=' + this.mode + '&folder=' + this.dir_name + '&image=' + this.im_name;
        var im_req;
        // branch for native XMLHttpRequest object
        if (window.XMLHttpRequest) {
            im_req = new XMLHttpRequest();
            im_req.open("GET", url, false);
            im_req.send('');
        }
        else if (window.ActiveXObject) {
            im_req = new ActiveXObject("Microsoft.XMLHTTP");
            if (im_req) {
                im_req.open("GET", url, false);
                im_req.send('');
            }
        }
       console.log(im_req);
	console.log(im_req.status); 
        console.log(im_req.responseText);
	if(im_req.status==200) {
            //this.dir_name = im_req.responseXML.getElementsByTagName("dir")[0].firstChild.nodeValue;
            //this.im_name = im_req.responseXML.getElementsByTagName("file")[0].firstChild.nodeValue;
            //Brian and I added thsi on 7/22 2pm
            var parser = new DOMParser();
            var doc = parser.parseFromString(im_req.responseText, "application/xml");
            this.dir_name=doc.getElementsByTagName("dir")[0].firstChild.nodeValue;
            this.im_name=doc.getElementsByTagName("file")[0].firstChild.nodeValue;
        }
        else {
            alert('Fatal: there are problems with fetch_image.cgi');
        }
    };
}
