
var clientId = '665807510546-ujpufvs720aiudi8bkrb378443pkbb0t.apps.googleusercontent.com';
var apiKey = 'AIzaSyCf8LC7KMoDq_5L4wvczO5hejEAdzK4DXE';
var scopes = ['https://www.googleapis.com/auth/tasks','https://www.googleapis.com/auth/plus.me'];

function handleClientLoad() {
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth,1);
}

function checkAuth() {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);

}


function handleAuthResult(authResult) {

    var authorizeButton = document.getElementById('login-button');
    if (authResult && !authResult.error) {
        authorizeButton.style.display = 'none';
        confirmation();

    } 
    else {
        authorizeButton.style.display = 'block';
        authorizeButton.onclick = handleAuthClick;
    
    }
}

function handleAuthClick(event) {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
    return false;
}


function makeApiCall() {
    gapi.client.load('tasks', 'v1', function() {
        var request = gapi.client.tasks.tasklists.list();
        request.execute(function(resp) {
            document.getElementById('content').innerHTML=
            resp.items[0].title;
        });
    });
}
function confirmation(){
    gapi.client.load('plus','v1',function(){
        var request = gapi.client.plus.people.get({
            'userId': 'me'
        })

        request.execute(function(resp){
            document.getElementById('logout').style.display='inline-block';
            document.getElementById('user-info').innerHTML=
            "User: " + resp.displayName;
            document.getElementById('logout-button').style.display='inline-block';
            document.getElementById('logout-button').onclick =logout;

        })

    })
}










$(function(){

    $(".content ")
        .contents()
        .filter(
            function(){
                return this.nodeType != 1; 
            })
        .wrap("<span/>").parent().each(
        function(){
            var size = 100;
            while(jQuery(this).parent().width() < jQuery(this).width() && size > 5){
                size -= 1;
                jQuery(this).css({'font-size' : size+'%'});
            }
    }
);
    function focusTab(item){
        $(  '#tabs li').each(function(){
            $(this).removeClass('active');
        });
        item.addClass('active');
        $('#clonedtabs li').each(function(){
            $(this).removeClass('active');
        });
        item.data("clone").addClass('active');
        $(".main div").each(function(){
            $(this).removeClass('active_container');
        });
        item.data("matching_container").addClass('active_container');
    }
    function cloneTabs(){
        $("#tabs li").each(function(){
            var item = $(this);
            var item_clone = item.clone();
            item.data("clone", item_clone);
            var position = item.position();

            item_clone.css("left", position.left);
            item_clone.css("top", position.top);
            $("#clonedtabs").append(item_clone);

        });
    }
    function list_tasklists(){
        gapi.client.load('tasks','v1',function(){
            var request = gapi.client.tasks.tasklists.list();
            request.execute(function(resp){
                for( i=0;i<resp.items.length;i++){
                    $('#tasklists').append('<div class="task" id='+resp.items[i].id+'><div class= "name">' + 
                        resp.items[i].title+'</div><img src="/static/mysite/del.png" class="delete-tasklist"></div');
                }
            })

        })      
    }

    function list_tasks(id){
        gapi.client.load('tasks','v1',function(){
            token=gapi.auth.getToken().access_token;
            url= "https://www.googleapis.com/tasks/v1/lists/"+id+"/tasks?access_token="+token;
          
            $.ajax({
                type: 'GET',
                url: url,
                async: false,
                contentType: "application/json",
                dataType: 'jsonp',
                success: function(resp) {
                    item= $("#tabs li:last-child");
                    for( i=0;i<resp.items.length;i++){
                        item.data("matching_container").append('<div class="content draggable resizable" id = '+ resp.items[i].id + 
                            '><img src="/static/mysite/del_task.png" class="delete-task">'+resp.items[i].title+'</div');
                    }
                    $(".draggable:not(.ui-draggable").draggable({
                        //grid:[5,10],
                        containment: $(".main"),
                        stack:".content"
                    });
                    $(".resizable").resizable();
                    
                },
                error: function(e) {
            
                }
            }); 


        })  

    }
 
    function newtab(name,list){

        $("#tabs").append('<li class="tab ui-sortable-handle">'+name+'<img src="/static/mysite/del.png" class="delete-tab"></li>');
        var item = $("#tabs li:last-child");
        var item_clone = item.clone();
        item.data("clone", item_clone);
        item.data("list", list);

        var position = item.position();
        item_clone.css("left", position.left);
        item_clone.css("top", position.top);
        $("#clonedtabs").append(item_clone);
        $('.main').append('<div class="container"></div>');
        var item_container = $(".main .container:last-child");
        item.data("matching_container",item_container);
        focusTab(item);

        $("#tabs").sortable("refresh");
    }
    

    $("#tasklists").on('click','.name',function(e){
        var list = $(this).parent();
        
        if (list.hasClass("opened")){
            focusTab(list.data("tab"));
        }
        else{
            newtab(list.text(),list);
            list.addClass("opened");
            list.data("tab",$("#tabs li:last-child"));

            list_tasks(list.attr('id'));
        }
        
    
    });

    $("#logout-button").on('click',function(e){
        e.preventDefault();
        var login = document.getElementById('login-button');

        var revoke_url = "https://accounts.google.com/o/oauth2/revoke?token="+gapi.auth.getToken().access_token;
        $.ajax({
            type: 'GET',
            url: revoke_url,
            async: false,
            contentType: "application/json",
            dataType: 'jsonp',
            success: function(nullResponse) {
                login.style.display='block';
                document.getElementById('logout').style.display='none';
            },
            error: function(e) {
        
            }
        });
   
    });

    $("#tasklists").on('click','.sidebar_header',function(e){
        if ($(this).hasClass("loaded")){
            $(this).siblings(".task").toggleClass("hide")
        }
        else{
            console.log("hi");
            $(this).addClass("loaded")
            list_tasklists();
        }
        
    });
    $("#task_buttons").on('click','.sidebar_header',function(e){
        
        $(this).siblings(".button").toggleClass("hide")
        

        
    });
    $("#tasklists").draggable({
        stop: function(event,ui){
            $( event.toElement ).one('click', function(e){ e.stopImmediatePropagation();})
        },
        handle:".tasklist-handle",
        axis:"y",
        containment: ".sidebar",
        delay:50
    })

    $("#task_buttons").draggable({
        stop: function(event,ui){
            $( event.toElement ).one('click', function(e){ e.stopImmediatePropagation();})
        },
        handle:".actions-handle",
        axis:"y",
        containment: ".sidebar",
        delay:50

    })

    $("#tabs").sortable({
        start: function(e, ui){

            ui.helper.addClass("exclude-me");
            $("#tabs li:not(.exclude-me)")
                .css("visibility", "hidden");
            ui.helper.data("clone").hide();
        },

        stop: function(e, ui){
            $("#tabs li.exclude-me").each(function(){
                var item = $(this);
                var clone = item.data("clone");
                var position = item.position();
                clone.css("left", position.left);
                clone.css("top", position.top);
                clone.show();
                item.removeClass("exclude-me");
            });
            $("#tabs li").css("visibility", "visible");
        },

        change: function(e, ui){
            $("#tabs li:not(.exclude-me, .ui-sortable-placeholder)").each(function(){
                var item = $(this);
                var clone = item.data("clone");
                clone.stop(true, false);
                var position = item.position();
                clone.animate({
                    left: position.left,
                    top:position.top}, 150);   
            });
        },
        axis:"x",
        revert:150,
        cancel:".delete-tab"
    });

    cloneTabs();
    $("#new-task").on('click',function(e){
        var name = prompt("Enter Task");
        id=$(".active").data("list").attr("id");
        gapi.client.load('tasks','v1',function(){
            var request = gapi.client.tasks.tasks.insert({
                    tasklist: id,
                    
                    resource:{
                        "title":name
                    }
                
            })
            request.execute(function(resp){
                $(".active").data("matching_container").append('<div class="content draggable resizable" id ='+resp.id+'>'+name+'<img src="/static/mysite/del_task.png" class="delete-task"></div');
                $(".draggable:not(.ui-draggable").draggable({
                        //grid:[5,10],
                        containment: $(".main")
                });
                $(".resizable").resizable({
                    
                });
            })

        })
    });
    $("#new-tab").on('click',function(e){
        e.preventDefault();
        var name = prompt("Enter tasklist name","New List");
        gapi.client.load('tasks','v1',function(){

            var request = gapi.client.tasks.tasklists.insert({
                    fields : "id",
                    resource :{
                        "title": name
                    }
            })
            request.execute(function(resp){
                
                $('#tasklists').append('<div class="task opened" id='+resp.id+'><div class="name">'+name+'</div><img src="/static/mysite/del.png" class="delete-tasklist"></div');
                    newtab(name,$("#tasklists .task:last-child"));
                    $("#tasklists .task:last-child").data("tab",$("#tabs li:last-child"));
                    
            })


        })  

    });
    $("#tasklists").on('click',".delete-tasklist",function(e){
        //var name = prompt("Confirm");
        var id = ($(this).parent().attr("id"));
        if ($(this).parent("div").hasClass("opened")){

            $(this).parent().data("tab").children(".delete-tab").trigger("click");
            //$(this).parent().data("tab").data("matching_container").remove();

        }
        $(this).parent().remove();
        gapi.client.load('tasks','v1',function(){
            token=gapi.auth.getToken().access_token;
            
            url= "https://www.googleapis.com/tasks/v1/users/@me/lists/"+id+"?access_token="+token;
          
            $.ajax({
                type: 'DELETE',
                url: url,
                async: false,
                success: function(resp) {
                },
                error: function(e) {
                }
            }); 
        })  
    });

    $(".main").on('click','.delete-task',function(e){
        var item = $(this)
        gapi.client.load('tasks','v1',function(){
            var request = gapi.client.tasks.tasks.delete({
                tasklist : $('.active').data("list").attr("id"),
                task :item.parent().attr("id")

            })
            request.execute(function(resp){
                item.parent().remove(); 
            })

        })

    })

    $('#tabs').on('mousedown','.tab',function(e){
        if(e.target.nodeName!="IMG" ){
            $('#tabs li').each(function(){
                $(this).removeClass('active');
            });
            $('#clonedtabs li').each(function(){
                $(this).removeClass('active');
            });
            $(".main div").each(function(){
                $(this).removeClass('active_container');
            });
            $(this).data("clone").addClass('active');

            $(this).addClass('active');
            $(this).data("matching_container").addClass('active_container');
        }
    });

    $("#tabs").on('click','.delete-tab',function(e){

        var animate=false;
        var tab_number= $(this).parent('li').index();
        var position = $(this).parent('li').position();

        
        if ($(this).parent('li').hasClass("active")){
            if ($(this).parent("li").is(":only-child")){
            }


            else if ($(this).parent("li").is(":last-child")){
                focusTab($(this).parent('li').prev(".tab"));
            }
            else{
                focusTab($(this).parent('li').next(".tab"));
            }
        }
        size = $("#clonedtabs li").size();

        $("#tabs li").css("visibility","hidden");
        $(this).parent().data("matching_container").remove();
        $(this).parent().data("list").removeClass("opened");
        $(this).parent().remove();

        $("#clonedtabs li").each(function(index){
            if (Math.abs(~~$(this).position().left-~~position.left)<100){
                $(this).remove();
            }
            if (~~$(this).position().left-~~position.left>100)
            {
                    animate=true;
                    $(this).animate({
                    left:"-=160px"}, 150,function(e){
                        $("#tabs li").css("visibility","visible");
                    });                    
            }
        });
        if (!animate){
             $("#tabs li").css("visibility","visible");
        }


    });
    $("#tasklists").on('mouseover','.name',function(e){
        $(this).parent().css("background-color","#eceff1");

    })
    $("#tasklists").on('mouseout','.name',function(e){
        $(this).parent().css("background-color","#fafafa");

    })
    $("#task_buttons").on('mouseover','.button',function(e){
        $(this).css("background-color","#eceff1");

    })
    $("#task_buttons").on('mouseout','.button',function(e){
        $(this).css("background-color","#fafafa");

    })
    
});



