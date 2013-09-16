$(document).bind('pageinit', function(){ 

        $.mobile.defaultPageTransition="none";
        $("input[data-type=search]").attr("type","search");

        timestamp= new Date().getTime();
        lastUrl=undefined;

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
                return hrefs[0] + "page/" + (pageNumber-1) + "/?json=1&count=8";
            } else {
                var hrefs=href.split("page/");
                return hrefs[0] + "page/" + (pageNumber-1) + "/?" + hrefs[1].split("/?")[1];
            }
        }

        function loadList(event, hash){

            var  currentPageNumber = parseInt(event.delegateTarget.href.split("page/")[1].split("/?")[0]);
            hash = "temp" + currentPageNumber;
            if (lastUrl!=event.delegateTarget.href) {
                lastUrl=event.delegateTarget.href;
                $.ajax({
                    url: event.delegateTarget.href,
                    beforeSend: function ( xhr ) {
                        $.mobile.showPageLoadingMsg();
                    },
                    success: function(data, textStatus, jqXHR) {
                        event.preventDefault();
                        var now = new Date().getTime();
                        var reload = (window.location.hash=="#" + hash);
                        if ((now-timestamp) > 200) {
                            //$("div#" + hash).remove();
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
                                
                                if (reload) {
                                    $("#" + hash).attr("id",hash + "1");
                                    window.location.hash=hash + "1";
                                } else {
                                    window.location.hash=hash;
                                }
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
        }

        var newsTemplate = '<div data-role="page" id="noticia"><div data-theme="a" data-role="header" data-position="absolute"><h3><img src="img/logoNeiker.jpg" /></h3></div><div data-role="content"><h2>{{.}}</h2></div><div data-theme="a" data-role="footer" data-position="absolute"><input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /></div></div>';
        var listTemplate = '<div data-role="page" id="temp{{page}}"><div data-theme="a" data-role="header" data-position="absolute"><img src="img/logoNeiker.jpg" /></div><div data-role="content"><ul data-role="listview" data-divider-theme="b" data-inset="true">{{#list}}<li data-theme="c"><a href="{{href}}" data-transition="slide" class="news"><h3 class="conFecha"><div class="fecpost"><span class="fecpostM">{{month}}</span><span class="fecpostD">{{day}}</span><span class="fecpostA">{{year}}</span></div><span class="titulo">{{title}}</span></h3></a></li>{{/list}}</ul><div data-role="controlgroup" data-type="horizontal" class="pagesButton"><a data-role="button" data-inline="true" href="" data-icon="arrow-l" data-iconpos="left">Atzera</a><a data-role="button" data-inline="true" href="" data-icon="arrow-r" data-iconpos="right">Aurrera</a></div><div data-theme="a" data-role="footer" data-position="absolute"><input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /></div></div>';

        var polillaTemplate = '<ul class="txtMin"><li><strong>Datu jasotzea:</strong> {{{startDate}}} - {{{endDate}}}</li><li><strong>Lekua:</strong> {{zona}}</li><li><strong>Egoera fenologikoa: </strong>{{fenState}}</li><li><strong>Sits zenbakia: </strong>{{polNumber}}</li></ul><p class="txtMin">Mahatsondoaren egoera fenologikoa Bagglioliniren arabera (1952)</p>';

        var estaciones = '<div data-role="page" id="estaciones"><div data-theme="a" data-role="header" data-position="absolute"><h3><img src="img/logoNeiker.jpg" /></h3></div><div data-role="content"><ul data-role="listview" data-divider-theme="b" data-inset="true"><li data-theme="c"><a href="http://www.avisosneiker.com/c/estaciones/estacionaltzola/page/1/?json=1&count=8" data-transition="slide" id="estaciones" class="newsList">Altzola</a></li><li data-theme="c"><a href="http://www.avisosneiker.com/c/estaciones/arkaute/page/1/?json=1&count=8" data-transition="slide" class="newsList">Arkaute</a></li><li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-arrastaria/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Arrastaria </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/banos-de-ebro/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Baños de Ebro </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-banos-elciego/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Baños-Elciego </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/elciego/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Elciego </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-elvillar/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Elvillar </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-espejo/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Espejo </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-etxano/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Etxano </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/gauna/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Gauna </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-getaria-este/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Getaria este </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-getaria-oeste/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Getaria oeste </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-gipuzkoa-manzano/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Gipuzkoa (Sagarrondoak) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/iturrieta-estaciones/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Iturrieta </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/kripan/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Kripan </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/montebuena-labastida-1/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Labastida 1 (Montebuena) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/la-llana-labastida-2/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Labastida 2 (La Llana) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/espirbel-labastida-3/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Labastida 3 (Espirbel) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/la-hueta-labastida-4/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Labastida 4 (La Hueta) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/carabrinas-labastida-5/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Labastida 5 (Carabriñas) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/laguardia-1/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Laguardia 1 </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/baja_laguardia/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Laguardia 2 (Laguardia baja) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/morales-laguardia/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Laguardia 3 (Morales) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/lanciego-oyon/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Lanciego (Oiongo bidea) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/lapuebla-de-labarca/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Lapuebla Labarka (Carralapuebla) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/leza/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Leza </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-lezama/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Lezama </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/llodio/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Laudio </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-morga/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Morga </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/navaridas/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Navaridas </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/navarrete/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Navarrete </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-olaberria/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Olaberria </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-onati/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Oñati </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/otazu/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Otazu </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/barriobusto/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Oion (Barriobusto) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/roitegi/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Roitegi </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/salinillas/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Gatzaga Buradon </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/salvatierra/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Agurain </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/samaniego/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Samaniego </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/subijana/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Subijana </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/trevino/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Treviño </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/villabuena/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Villabuena </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/yecora/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Yécora </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/zambrana_patata/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Zambrana (patata) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/zambrana_remolacha/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Zambrana (remolacha) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-zarautz/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Zarautz </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/zona-baja-de-lanciego/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Lantziegoko behekaldea </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-forestal-de-avisos/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Ohianeko abisuak </a></li></ul></div><div data-theme="a" data-role="footer" data-position="absolute"><input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /></div></div>';
        var comarcas = '<div data-role="page" id="comarcas"> <div data-theme="a" data-role="header" data-position="absolute"> <h3> <img src="img/logoNeiker.jpg" /> </h3> </div> <div data-role="content"> <ul data-role="listview" data-divider-theme="b" data-inset="true"> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/llanada-alavesa/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Arabako lautada </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/montana-alavesa/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Mendate arabarrak </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/cantabrica-alavesa/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Arabar kantabrikoa </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/estribaciones-gorbea/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Gorbea inguruak </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/valles-alaveses/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Bailara arabarrak </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/rioja-alavesa/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Arabar Errioxa </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/bidasoa/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Bidasoa Behea </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/urola-costa/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Urola kosta </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/arabako-txakolina/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Arabako Txakolina </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/getariako-txakolina/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Getariako Txakolina </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/bizkaiko-txakolina/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Bizkaiko Txakolina </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/gipuzkoa/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Gipuzkoa </a> </li> </ul> </div> <div data-theme="a" data-role="footer" data-position="absolute"> <input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /> </div> </div>';
        var cultivos = '<div data-role="page" id="cultivos"> <div data-theme="a" data-role="header" data-position="absolute" data-inline="true"> <img src="img/logoNeiker.jpg" /> </div> <div data-role="content"> <ul data-role="listview" data-divider-theme="b" data-inset="true"> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/cultivos/page/1/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/all.png" class="ui-li-thumb " /> Denak </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/cultivos/patata/page/1/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/patata.png" class="ui-li-thumb" /> Patata </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/cultivos/remolacha/page/1/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/remolacha.png" class="ui-li-thumb" /> Erremolatxa </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/cultivos/vid/page/1/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/vid.png" class="ui-li-thumb" /> Mahatsondoa </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/cultivos/tomate/page/1/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/tomate.png" class="ui-li-thumb" /> Tomatea </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/cultivos/forestal/page/1/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/forestal.png" class="ui-li-thumb" /> Oihanekoa </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/cultivos/cereales/page/1/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/cultivos.png" class="ui-li-thumb" /> Zereala </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/cultivos/manzano/page/1/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/manzano.jpg" class="ui-li-thumb" /> Sagarrondoa </a> </li> </ul> </div> <div data-theme="a" data-role="footer" data-position="absolute"> <input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /> </div> </div>';
        var enfermedades = '<div data-role="page" id="enfermedades"> <div data-theme="a" data-role="header" data-position="absolute"> <h3> <img src="img/logoNeiker.jpg" /> </h3> </div> <div data-role="content"> <ul data-role="listview" data-divider-theme="b" data-inset="true"> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Denak </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/cercospora/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Cercospora </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/mildiu/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Gorrina (Mildiu) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/oidio/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Oidio </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/botritis/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Botritis </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/mildiu-viticola/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Mahastiko gorrina (Mildiu) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/fusarium-circinatum-chancro-resinoso/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Fusarium Circinatum (erretxinadun txankroa) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/nematodo-del-pino/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Pinuaren Nematodoa </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/armillaria/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Armillaria </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/diplodia-pinea/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Diplodia pinea </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/heterobasidion/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Heterobasidion </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/botryosphaeria-dothidea-en-eucalipto/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Botryosphaeria dothidea (Eukaliptoan) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/mycosphaerella-en-eucalipto/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Mycosphaerella (Eukaliptoan) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/enfermedades/alternariosis/page/1/?json=1&count=8" data-transition="slide" class="newsList"> Alternariosis </a> </li> </ul> </div> <div data-theme="a" data-role="footer" data-position="absolute"> <input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /> </div> </div>';
        var plagas = '<div data-role="page" id="plagas"> <div data-theme="a" data-role="header" data-position="fixed"> <h3> <img src="img/logoNeiker.jpg" /> </h3> </div> <div data-role="content"> <ul data-role="listview" data-divider-theme="b" data-inset="true"> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/plagas/page/1/?json=1&count=8" data-transition="slide" class="newsList plagas"> Denak </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/plagas/polilla/page/1/?json=1&count=8" data-transition="slide" class="newsList plagas"> Sits (Polilla) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/plagas/pulgon/page/1/?json=1&count=8" data-transition="slide" class="newsList plagas"> Landare zorria </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/plagas/recuentopulgones/page/1/?json=1&count=8" data-transition="slide" class="newsList plagas"> Landare zorrien zenbaketa </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/plagas/recuentopolilla/page/1/?json=1&count=8" data-transition="slide" class="newsList plagas"> Sitsen zenbaketa </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/plagas/avispa-vespa-velutina/page/1/?json=1&count=8" data-transition="slide" class="newsList plagas"> "Vespa velutina" liztorra </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/plagas/escolitidos/page/1/?json=1&count=8" data-transition="slide" class="newsList plagas"> Eskolitidoak </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/plagas/otiorrinco-del-olivo/page/1/?json=1&count=8" data-transition="slide" class="newsList plagas"> Olibondoaren otiorrinkoa </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/plagas/carpocasa/page/1/?json=1&count=8" data-transition="slide" class="newsList plagas"> Karpokapsa </a> </li> </ul> </div> <div data-theme="a" data-role="footer" data-position="absolute"> <input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /> </div> </div>';

        var months = ["URT","OTS","MAR","API","MAI","EKA","UZT","ABU","IRA","URR","AZA","ABE"];

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

        $("a.newsList").on("click",function(event) {
            event.preventDefault();
            loadList(event);
        });

        $("input[data-type=search]").on("keydown",function(event) {
            if (event.keyCode==13) {
                event.target.href="http://www.avisosneiker.com/page/1/?s=" + $("input[data-type=search]:visible").val() +"&submit=Buscar&json=1&count=8";
                loadList(event);
            }
        });

        $("div.pagesButton a").on("click", function(event){
            event.preventDefault();
            loadList(event);
        });

        $(".otherMenu").on("click", function(event) {
            var html = $.parseHTML(eval(event.currentTarget.id));
            $("body").append(html);
            $.mobile.changePage("#" + event.currentTarget.id ,{ transition: "none", changeHash: false }); 
            window.location.hash=event.currentTarget.id;
        });

        $("div[data-role=header] img").on("click", function(event){
            if ($("#home:visible").length == 0) {
                $.mobile.changePage("#home",{ transition: "none", changeHash: false });
            }
        });
    });