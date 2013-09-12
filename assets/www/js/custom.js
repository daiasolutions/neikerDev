$(document).bind('pageinit', function(){ 

        $.mobile.defaultPageTransition="none";
        $("input[data-type=search]").attr("type","search");

        timestamp= new Date().getTime();

        function getNextPageHref(href, pageNumber) {
            if (href.indexOf("Buscar")==-1) {
                var hrefs=href.split("page/");
                return hrefs[0] + "page/" + (pageNumber+1) + "/?json=1";
            } else {
                var hrefs=href.split("page/");
                return hrefs[0] + "page/" + (pageNumber+1) + "/?" + hrefs[1].split("/?")[1];
            }
        }

        function getPreviousPageHref(href, pageNumber) {
            if (href.indexOf("Buscar")==-1) {
                var hrefs=href.split("page/");
                return hrefs[0] + "page/" + (pageNumber-1) + "/?json=1";
            } else {
                var hrefs=href.split("page/");
                return hrefs[0] + "page/" + (pageNumber-1) + "/?" + hrefs[1].split("/?")[1];
            }
        }

        function loadList(event, hash){
            var  currentPageNumber = parseInt(event.delegateTarget.href.split("page/")[1].split("/?")[0]);
            hash = "temp" + currentPageNumber;
            $.ajax({
                url: event.delegateTarget.href,
                beforeSend: function ( xhr ) {
                    $.mobile.showPageLoadingMsg();
                },
                success: function(data, textStatus, jqXHR) {
                    event.preventDefault();
                    var now = new Date().getTime();
                    if ((now-timestamp) > 200) {
                        $("div#" + hash).remove();
                        var json=$.parseJSON(data);
                        var totalPages = json.pages;

                        if (json.count==0) {//If no result
                            var title = "Ez da emaitzarik aurkitu";
                            var html = Mustache.to_html(newsTemplate, title);
                            var content = $(html).find("div[data-role=content]")[0];
                            $('body').append(html);
                            $("#noticia > div[data-role=content]").replaceWith(content);
                            $.mobile.hidePageLoadingMsg();
                            $.mobile.changePage("#noticia",{ transition: "none", changeHash: false });
                        } else { //if result loop for get json of every post

                            //Generate json to fill template
                            var list=[];
                            for (var i = 0; i < json.posts.length; i++) {
                                var post=json.posts[i];
                                var object = {};
                                object.title=post.title;
                                object.href=post.url + "?json=1";
                                var date = new Date(post.date);
                                object.day=date.getDate();
                                object.month=months[date.getMonth()];
                                object.year=date.getYear()+1900;
                                list.push(object);
                            };
                            var object = {};
                            object.list=list;
                            object.page = currentPageNumber;

                            //Create html and append it to body
                            var html = Mustache.to_html(listTemplate, object);
                            $('body').append(html);

                            //$("#" + hash +" ul:visible").listview("refresh");
                            window.location.hash=hash;
                            $.mobile.changePage("#" + hash,{ transition: "none", changeHash: false });

                            //Buttons of next and previous page depending
                            if (currentPageNumber==1) {
                                if (totalPages!=1) {
                                    $("div.pagesButton a[data-icon=arrow-r]").css("display","block");
                                    $("div.pagesButton a[data-icon=arrow-r]").attr("href",
                                        getNextPageHref(event.delegateTarget.href,currentPageNumber));
                                }
                            } else {
                                $("div.pagesButton a[data-icon=arrow-l]").css("display","block");
                                $("div.pagesButton a[data-icon=arrow-l]").attr("href",
                                    getPreviousPageHref(event.delegateTarget.href,currentPageNumber));
                                if (currentPageNumber!=totalPages) {
                                    $("div.pagesButton a[data-icon=arrow-r]").css("display","block");
                                    $("div.pagesButton a[data-icon=arrow-r]").attr("href",
                                    getNextPageHref(event.delegateTarget.href,currentPageNumber));
                                }
                            }

                            $.mobile.hidePageLoadingMsg();
                        }        
                    }
                },
                error: function(event) {
                    var title = "Arazoak ditugu konekxioarekin, saiatu geroago berriz";
                    var html = Mustache.to_html(newsTemplate, title);
                    var content = $(html).find("div[data-role=content]")[0];
                    $('body').append(html);
                    $("#noticia > div[data-role=content]").replaceWith(content);
                    $.mobile.hidePageLoadingMsg();
                    $.mobile.changePage("#noticia",{ transition: "none", changeHash: false });
                }
            });
        }

        //on click
        $("a.news").on("click", function(event) {
        event.preventDefault();
        $.ajax({
            url: event.delegateTarget.href,
            beforeSend: function ( xhr ) {
                $.mobile.showPageLoadingMsg();
            },
            success: function(data, textStatus, jqXHR) {
                var json=$.parseJSON(data);
                pepe=json.post.custom_fields;
                $("div#noticia").remove();
                window.location.hash="noticia";                   

                //create JSON object to fill template
                var title=json.post.title;

                var div = document.createElement('div');
                div.innerHTML = json.post.content;
                var htmlPolilla;
                var html = Mustache.to_html(newsTemplate, title);
                var content = $(html).find("div[data-role=content]")[0];
                $(content).append(div);
                $('body').append(html);
                $("#noticia > div[data-role=content]").replaceWith(content);
                if (json.post.title.indexOf("recuento de polillas")!= -1 || 
                    json.post.title.indexOf("Recuento de polillas")!= -1) {
                    var fields = json.post.custom_fields;
                    var polillaJSON = {};
                    polillaJSON.startDate=fields["Fecha Inicio"][0];
                    polillaJSON.endDate=fields["Fecha Fin"][0];
                    polillaJSON.zona=fields["Zona"][0];
                    polillaJSON.fenState=fields["Estado_Fenologico"][0];
                    polillaJSON.polNumber=fields["Lobesia"][0];
                    htmlPolilla = Mustache.to_html(polillaTemplate,polillaJSON);
                    $("#noticia h2").after(htmlPolilla);
                }
                $.mobile.hidePageLoadingMsg();
                $.mobile.changePage("#noticia",{ transition: "slide", changeHash: false });
            },
            error: function(event) {
                var title = "Arazoak ditugu konekxioarekin, saiatu geroago berriz";
                var html = Mustache.to_html(newsTemplate, title);
                var content = $(html).find("div[data-role=content]")[0];
                $('body').append(html);
                $("#noticia > div[data-role=content]").replaceWith(content);
                $.mobile.hidePageLoadingMsg();
                $.mobile.changePage("#noticia",{ transition: "none", changeHash: false });
            }
        });
        });

        var newsTemplate = '<div data-role="page" id="noticia"><div data-theme="a" data-role="header" data-position="absolute"><h3><img src="img/logoNeiker.jpg" /></h3></div><div data-role="content"><h2>{{.}}</h2></div><div data-theme="a" data-role="footer" data-position="fixed"><input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /></div></div>';
        var listTemplate = '<div data-role="page" id="temp{{page}}"><div data-theme="a" data-role="header" data-position="absolute"><img src="img/logoNeiker.jpg" /></div><div data-role="content"><ul data-role="listview" data-divider-theme="b" data-inset="true">{{#list}}<li data-theme="c"><a href="{{href}}" data-transition="slide" class="news"><h3 class="conFecha"><div class="fecpost"><span class="fecpostM">{{month}}</span><span class="fecpostD">{{day}}</span><span class="fecpostA">{{year}}</span></div><span class="titulo">{{title}}</span></h3></a></li>{{/list}}</ul><div data-role="controlgroup" data-type="horizontal" class="pagesButton"><a data-role="button" data-inline="true" href="" data-icon="arrow-l" data-iconpos="left">Atzera</a><a data-role="button" data-inline="true" href="" data-icon="arrow-r" data-iconpos="right">Aurrera</a></div><div data-theme="a" data-role="footer" data-position="fixed"><input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /></div></div>';

        var polillaTemplate = '<ul class="txtMin"><li><strong>Datu jasotzea:</strong> {{{startDate}}} - {{{endDate}}}</li><li><strong>Lekua:</strong> {{zona}}</li><li><strong>Egoera fenologikoa: </strong>{{fenState}}</li><li><strong>Sits zenbakia: </strong>{{polNumber}}</li></ul><p class="txtMin">Mahatsondoaren egoera fenologikoa Bagglioliniren arabera (1952)</p>';

        var months = ["URT","OTS","MAR","API","MAI","EKA","UZT","ABU","IRA","URR","AZA","ABE"];

        $("a.newsList").on("click",function(event) {
            event.preventDefault();
            loadList(event);
        });

        $("input[data-type=search]").on("keydown",function(event) {
            if (event.keyCode==13) {
                event.target.href="http://www.avisosneiker.com/page/1/?s=" + $("input[data-type=search]").val() +"&submit=Buscar&json=1";
                loadList(event);
            }
        });

        $("div.pagesButton a").on("click", function(event){
            event.preventDefault();
            loadList(event);
        });

        $(".ui-grid-b a.otherMenu").on("click", function(event) {
            event.preventDefault();
            window.location.hash=event.delegateTarget.href.split("#")[1];
            $.mobile.changePage(event.delegateTarget.href,{ transition: "none", changeHash: false }); 
        });
    });