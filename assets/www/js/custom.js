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
            var currentPageNumber;
            if (event.delegateTarget.href.split("page/").length>1) {
                currentPageNumber = parseInt(event.delegateTarget.href.split("page/")[1].split("/?")[0]);
            } else {
                currentPageNumber = 1;
            }
            var hash = "temp" + new Date().getTime();
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
                                    object.month=eval(months[date.getMonth()]);
                                    object.year=date.getYear()+1900;
                                    list.push(object);
                                };
                                var object = {};
                                object.list=list;
                                object.page = currentPageNumber;

                                //Create html and append it to body
                                var html = Mustache.to_html(listTemplate, object);
                                $('body').append(html);
                                $("#temp").attr("id",hash);
                                window.location.hash="temp" + currentPageNumber;
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
                    error: function(jqXHR,textStatus,errorThrown) {
                        var title = "Arazoak ditugu konekxioarekin, saiatu geroago berriz";
                        var html = Mustache.to_html(newsTemplate, title);
                        var content = $(html).find("div[data-role=content]")[0];
                        $('body').append(html);
                        $("#noticia > div[data-role=content]").replaceWith(content);
                        var id="noticia" + new Date().getTime();
                        $("#noticia").attr("id",id);
                        $.mobile.hidePageLoadingMsg();
                        $.mobile.changePage("#" + id,{ transition: "none", changeHash: false });
                    }
                });
            }
        }

        var newsTemplate = '<div data-role="page" id="noticia"><div data-theme="a" data-role="header" data-position="absolute"> <img class="spanish" src="img/espana.gif" /> <h3> <img id="logo" src="img/logoNeiker.jpg" /> </h3> <img class="euskera" src="img/ikurrina.gif" /> </div><div data-role="content"><h2>{{.}}</h2></div><div data-theme="a" data-role="footer" data-position="absolute"><input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /></div></div>';
        var listTemplate = '<div data-role="page" id="temp"><div data-theme="a" data-role="header" data-position="absolute"> <img class="spanish" src="img/espana.gif" /> <h3> <img id="logo" src="img/logoNeiker.jpg" /> </h3> <img class="euskera" src="img/ikurrina.gif" /> </div><div data-role="content"><ul data-role="listview" data-divider-theme="b" data-inset="true">{{#list}}<li data-theme="c"><a href="{{href}}" data-transition="slide" class="news"><h3 class="conFecha"><div class="fecpost"><span class="fecpostM">{{month}}</span><span class="fecpostD">{{day}}</span><span class="fecpostA">{{year}}</span></div><span class="titulo">{{title}}</span></h3></a></li>{{/list}}</ul><div data-role="controlgroup" data-type="horizontal" class="pagesButton"><a data-role="button" data-inline="true" href="" data-icon="arrow-l" data-iconpos="left">Atzera</a><a data-role="button" data-inline="true" href="" data-icon="arrow-r" data-iconpos="right">Aurrera</a></div><div data-theme="a" data-role="footer" data-position="absolute"><input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /></div></div>';

        var polillaTemplate = '<ul class="txtMin"><li><strong>Datu jasotzea:</strong> {{{startDate}}} - {{{endDate}}}</li><li><strong>Lekua:</strong> {{zona}}</li><li><strong>Egoera fenologikoa: </strong>{{fenState}}</li><li><strong>Sits zenbakia: </strong>{{polNumber}}</li></ul><p class="txtMin">Mahatsondoaren egoera fenologikoa Bagglioliniren arabera (1952)</p>';

        var estaciones = '<div data-role="page" id="estacionesList"><div data-theme="a" data-role="header" data-position="absolute"> <img class="spanish" src="img/espana.gif" /> <h3> <img id="logo" src="img/logoNeiker.jpg" /> </h3> <img class="euskera" src="img/ikurrina.gif" /> </div><div data-role="content"><ul data-role="listview" data-divider-theme="b" data-inset="true"><li data-theme="c"><a href="http://www.avisosneiker.com/c/estaciones/estacionaltzola/?json=1&count=8" data-transition="slide" class="newsList">Altzola</a></li><li data-theme="c"><a href="http://www.avisosneiker.com/c/estaciones/arkaute/?json=1&count=8" data-transition="slide" class="newsList">Arkaute</a></li><li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-arrastaria/?json=1&count=8" data-transition="slide" class="newsList"> Arrastaria </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/banos-de-ebro/?json=1&count=8" data-transition="slide" class="newsList"> Baños de Ebro </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-banos-elciego/?json=1&count=8" data-transition="slide" class="newsList"> Baños-Elciego </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/elciego/?json=1&count=8" data-transition="slide" class="newsList"> Elciego </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-elvillar/?json=1&count=8" data-transition="slide" class="newsList"> Elvillar </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-espejo/?json=1&count=8" data-transition="slide" class="newsList"> Espejo </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-etxano/?json=1&count=8" data-transition="slide" class="newsList"> Etxano </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/gauna/?json=1&count=8" data-transition="slide" class="newsList"> Gauna </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-getaria-este/?json=1&count=8" data-transition="slide" class="newsList"> Getaria este </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-getaria-oeste/?json=1&count=8" data-transition="slide" class="newsList"> Getaria oeste </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-gipuzkoa-manzano/?json=1&count=8" data-transition="slide" class="newsList"> Gipuzkoa (Sagarrondoak) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/iturrieta-estaciones/?json=1&count=8" data-transition="slide" class="newsList"> Iturrieta </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/kripan/?json=1&count=8" data-transition="slide" class="newsList"> Kripan </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/montebuena-labastida-1/?json=1&count=8" data-transition="slide" class="newsList"> Labastida 1 (Montebuena) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/la-llana-labastida-2/?json=1&count=8" data-transition="slide" class="newsList"> Labastida 2 (La Llana) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/espirbel-labastida-3/?json=1&count=8" data-transition="slide" class="newsList"> Labastida 3 (Espirbel) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/la-hueta-labastida-4/?json=1&count=8" data-transition="slide" class="newsList"> Labastida 4 (La Hueta) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/carabrinas-labastida-5/?json=1&count=8" data-transition="slide" class="newsList"> Labastida 5 (Carabriñas) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/laguardia-1/?json=1&count=8" data-transition="slide" class="newsList"> Laguardia 1 </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/baja_laguardia/?json=1&count=8" data-transition="slide" class="newsList"> Laguardia 2 (Laguardia baja) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/morales-laguardia/?json=1&count=8" data-transition="slide" class="newsList"> Laguardia 3 (Morales) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/lanciego-oyon/?json=1&count=8" data-transition="slide" class="newsList"> Lanciego (Oiongo bidea) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/lapuebla-de-labarca/?json=1&count=8" data-transition="slide" class="newsList"> Lapuebla Labarka (Carralapuebla) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/leza/?json=1&count=8" data-transition="slide" class="newsList"> Leza </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-lezama/?json=1&count=8" data-transition="slide" class="newsList"> Lezama </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/llodio/?json=1&count=8" data-transition="slide" class="newsList"> Laudio </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-morga/?json=1&count=8" data-transition="slide" class="newsList"> Morga </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/navaridas/?json=1&count=8" data-transition="slide" class="newsList"> Navaridas </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/navarrete/?json=1&count=8" data-transition="slide" class="newsList"> Navarrete </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-olaberria/?json=1&count=8" data-transition="slide" class="newsList"> Olaberria </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-onati/?json=1&count=8" data-transition="slide" class="newsList"> Oñati </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/otazu/?json=1&count=8" data-transition="slide" class="newsList"> Otazu </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/barriobusto/?json=1&count=8" data-transition="slide" class="newsList"> Oion (Barriobusto) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/roitegi/?json=1&count=8" data-transition="slide" class="newsList"> Roitegi </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/salinillas/?json=1&count=8" data-transition="slide" class="newsList"> Gatzaga Buradon </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/salvatierra/?json=1&count=8" data-transition="slide" class="newsList"> Agurain </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/samaniego/?json=1&count=8" data-transition="slide" class="newsList"> Samaniego </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/subijana/?json=1&count=8" data-transition="slide" class="newsList"> Subijana </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/trevino/?json=1&count=8" data-transition="slide" class="newsList"> Treviño </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/villabuena/?json=1&count=8" data-transition="slide" class="newsList"> Villabuena </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/yecora/?json=1&count=8" data-transition="slide" class="newsList"> Yécora </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/zambrana_patata/?json=1&count=8" data-transition="slide" class="newsList"> Zambrana (patata) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/zambrana_remolacha/?json=1&count=8" data-transition="slide" class="newsList"> Zambrana (remolacha) </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-de-zarautz/?json=1&count=8" data-transition="slide" class="newsList"> Zarautz </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/zona-baja-de-lanciego/?json=1&count=8" data-transition="slide" class="newsList"> Lantziegoko behekaldea </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/estaciones/estacion-forestal-de-avisos/?json=1&count=8" data-transition="slide" class="newsList"> Ohianeko abisuak </a></li></ul></div><div data-theme="a" data-role="footer" data-position="absolute"><input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /></div></div>';
        var comarcas = '<div data-role="page" id="comarcasList"> <div data-theme="a" data-role="header" data-position="absolute"> <img class="spanish" src="img/espana.gif" /> <h3> <img id="logo" src="img/logoNeiker.jpg" /> </h3> <img class="euskera" src="img/ikurrina.gif" /> </div><div data-role="content"> <ul data-role="listview" data-divider-theme="b" data-inset="true"> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/llanada-alavesa/?json=1&count=8" data-transition="slide" class="newsList" id="llanada_alavesa"> Arabako lautada </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/montana-alavesa/?json=1&count=8" data-transition="slide" class="newsList" id="montana_alavesa"> Mendate arabarrak </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/cantabrica-alavesa/?json=1&count=8" data-transition="slide" class="newsList" id="cantabrica_alavesa"> Arabar kantabrikoa </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/estribaciones-gorbea/?json=1&count=8" data-transition="slide" class="newsList" id="estribaciones_gorbea"> Gorbea inguruak </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/valles-alaveses/?json=1&count=8" data-transition="slide" class="newsList" id="valles_alaveses"> Bailara arabarrak </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/rioja-alavesa/?json=1&count=8" data-transition="slide" class="newsList" id="rioja_alavesa"> Arabar Errioxa </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/bidasoa/?json=1&count=8" data-transition="slide" class="newsList" id="bajo_bidasoa"> Bidasoa Behea </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/urola-costa/?json=1&count=8" data-transition="slide" class="newsList" id="urola_costa"> Urola kosta </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/arabako-txakolina/?json=1&count=8" data-transition="slide" class="newsList" id="arabako_txakolina"> Arabako Txakolina </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/getariako-txakolina/?json=1&count=8" data-transition="slide" class="newsList" id="getariako_txakolina"> Getariako Txakolina </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/bizkaiako-txakolina/?json=1&count=8" data-transition="slide" class="newsList" id="bizkaiako_txakolina"> Bizkaiako Txakolina </a> </li> <li data-theme="c"> <a href="http://www.avisosneiker.com/c/comarca/gipuzkoa/?json=1&count=8" data-transition="slide" class="newsList" id="gipuzkoa"> Gipuzkoa </a> </li> </ul> </div> <div data-theme="a" data-role="footer" data-position="absolute"> <input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /> </div> </div>';
        var cultivos = '<div data-role="page" id="cultivosList"> <div data-theme="a" data-role="header" data-position="absolute"> <img class="spanish" src="img/espana.gif" /> <h3> <img id="logo" src="img/logoNeiker.jpg" /> </h3> <img class="euskera" src="img/ikurrina.gif" /> </div><div data-role="content"> <ul data-role="listview" data-divider-theme="b" data-inset="true"> <li data-theme="c"> <a id="todos" href="http://www.avisosneiker.com/c/cultivos/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/all.png" class="ui-li-thumb " /> Denak </a> </li> <li data-theme="c"> <a id="patata" href="http://www.avisosneiker.com/c/cultivos/patata/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/patata.png" class="ui-li-thumb" /> Patata </a> </li> <li data-theme="c"> <a id="remolacha" href="http://www.avisosneiker.com/c/cultivos/remolacha/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/remolacha.png" class="ui-li-thumb" /> Erremolatxa </a> </li> <li data-theme="c"> <a id="vid" href="http://www.avisosneiker.com/c/cultivos/vid/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/vid.png" class="ui-li-thumb" /> Mahatsondoa </a> </li> <li data-theme="c"> <a id="tomate" href="http://www.avisosneiker.com/c/cultivos/tomate/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/tomate.png" class="ui-li-thumb" /> Tomatea </a> </li> <li data-theme="c"> <a id="forestal" href="http://www.avisosneiker.com/c/cultivos/forestal/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/forestal.png" class="ui-li-thumb" /> Oihanekoa </a> </li> <li data-theme="c"> <a id="cereal" href="http://www.avisosneiker.com/c/cultivos/cereales/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/cultivos.png" class="ui-li-thumb" /> Zereala </a> </li> <li data-theme="c"> <a id="manzano" href="http://www.avisosneiker.com/c/cultivos/manzano/?json=1&count=8" data-transition="slide" class="newsList"> <img src="img/manzano.png" class="ui-li-thumb" /> Sagarrondoa </a> </li> </ul> </div> <div data-theme="a" data-role="footer" data-position="absolute"> <input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /> </div> </div>';
        var enfermedades = '<div data-role="page" id="enfermedadesList"><div data-theme="a" data-role="header" data-position="absolute"> <img class="spanish" src="img/espana.gif" /> <h3> <img id="logo" src="img/logoNeiker.jpg" /> </h3> <img class="euskera" src="img/ikurrina.gif" /> </div> <div data-role="content"> <ul data-role="listview" data-divider-theme="b" data-inset="true"> <li data-theme="c"> <a id="todos" href="http://www.avisosneiker.com/c/enfermedades/?json=1&count=8" data-transition="slide" class="newsList"> Denak </a> </li> <li data-theme="c"> <a id="cercospora" href="http://www.avisosneiker.com/c/enfermedades/cercospora/?json=1&count=8" data-transition="slide" class="newsList"> Cercospora </a> </li> <li data-theme="c"> <a id="mildiu" href="http://www.avisosneiker.com/c/enfermedades/mildiu/?json=1&count=8" data-transition="slide" class="newsList"> Gorrina (Mildiu) </a> </li> <li data-theme="c"> <a id="oidio" href="http://www.avisosneiker.com/c/enfermedades/oidio/?json=1&count=8" data-transition="slide" class="newsList"> Oidio </a> </li> <li data-theme="c"> <a id="botritis" href="http://www.avisosneiker.com/c/enfermedades/botritis/?json=1&count=8" data-transition="slide" class="newsList"> Botritis </a> </li> <li data-theme="c"> <a id="mildiu_viticola" href="http://www.avisosneiker.com/c/enfermedades/mildiu-viticola/?json=1&count=8" data-transition="slide" class="newsList"> Mahastiko gorrina (Mildiu) </a> </li> <li data-theme="c"> <a id="fusarium_circinatum" href="http://www.avisosneiker.com/c/enfermedades/fusarium-circinatum-chancro-resinoso/?json=1&count=8" data-transition="slide" class="newsList"> Fusarium Circinatum (erretxinadun txankroa) </a> </li> <li data-theme="c"> <a id="nematodo_del_pino" href="http://www.avisosneiker.com/c/enfermedades/nematodo-del-pino/?json=1&count=8" data-transition="slide" class="newsList"> Pinuaren Nematodoa </a> </li> <li data-theme="c"> <a id="armillaria" href="http://www.avisosneiker.com/c/enfermedades/armillaria/?json=1&count=8" data-transition="slide" class="newsList"> Armillaria </a> </li> <li data-theme="c"> <a id="diplodia_pinea" href="http://www.avisosneiker.com/c/enfermedades/diplodia-pinea/?json=1&count=8" data-transition="slide" class="newsList"> Diplodia pinea </a> </li> <li data-theme="c"> <a id="heterobasidion" href="http://www.avisosneiker.com/c/enfermedades/heterobasidion/?json=1&count=8" data-transition="slide" class="newsList"> Heterobasidion </a> </li> <li data-theme="c"> <a id="botryosphaeria_dothidea" href="http://www.avisosneiker.com/c/enfermedades/botryosphaeria-dothidea-en-eucalipto/?json=1&count=8" data-transition="slide" class="newsList"> Botryosphaeria dothidea (Eukaliptoan) </a> </li> <li data-theme="c"> <a id="mycosphaerella" href="http://www.avisosneiker.com/c/enfermedades/mycosphaerella-en-eucalipto/?json=1&count=8" data-transition="slide" class="newsList"> Mycosphaerella (Eukaliptoan) </a> </li> <li data-theme="c"> <a id="alternariosis" href="http://www.avisosneiker.com/c/enfermedades/alternariosis/?json=1&count=8" data-transition="slide" class="newsList"> Alternariosis </a> </li> </ul> </div> <div data-theme="a" data-role="footer" data-position="absolute"> <input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /> </div> </div>';
        var plagas = '<div data-role="page" id="plagasList"> <div data-theme="a" data-role="header" data-position="absolute"> <img class="spanish" src="img/espana.gif" /> <h3> <img id="logo" src="img/logoNeiker.jpg" /> </h3> <img class="euskera" src="img/ikurrina.gif" /> </div> <div data-role="content"> <ul data-role="listview" data-divider-theme="b" data-inset="true"> <li data-theme="c"> <a id="todos" href="http://www.avisosneiker.com/c/plagas/?json=1&count=8" data-transition="slide" class="newsList plagas"> Denak </a> </li> <li data-theme="c"> <a id="polilla" href="http://www.avisosneiker.com/c/plagas/polilla/?json=1&count=8" data-transition="slide" class="newsList plagas"> Sits (Polilla) </a> </li> <li data-theme="c"> <a id="pulgon" href="http://www.avisosneiker.com/c/plagas/pulgon/?json=1&count=8" data-transition="slide" class="newsList plagas"> Landare zorria </a> </li> <li data-theme="c"> <a id="recuento_pulgones" href="http://www.avisosneiker.com/c/plagas/recuentopulgones/?json=1&count=8" data-transition="slide" class="newsList plagas"> Landare zorrien zenbaketa </a> </li> <li data-theme="c"> <a id="recuento_pulgones" href="http://www.avisosneiker.com/c/plagas/recuentopolilla/?json=1&count=8" data-transition="slide" class="newsList plagas"> Sitsen zenbaketa </a> </li> <li data-theme="c"> <a id="vespa_velutina" href="http://www.avisosneiker.com/c/plagas/avispa-vespa-velutina/?json=1&count=8" data-transition="slide" class="newsList plagas"> "Vespa velutina" liztorra </a> </li> <li data-theme="c"> <a id="escolitidos" href="http://www.avisosneiker.com/c/plagas/escolitidos/?json=1&count=8" data-transition="slide" class="newsList plagas"> Eskolitidoak </a> </li> <li data-theme="c"> <a id="otiorrinco_olivo" href="http://www.avisosneiker.com/c/plagas/otiorrinco-del-olivo/?json=1&count=8" data-transition="slide" class="newsList plagas"> Olibondoaren otiorrinkoa </a> </li> <li data-theme="c"> <a id="carpocapsa" href="http://www.avisosneiker.com/c/plagas/carpocasa/?json=1&count=8" data-transition="slide" class="newsList plagas"> Karpokapsa </a> </li> </ul> </div> <div data-theme="a" data-role="footer" data-position="absolute"> <input type="search" name="search" placeholder="Berriak bilatu" data-mini="true" data-theme="c" /> </div> </div>';

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
                    if ($("#noticia").length!=0) var noticiaExists=true;
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
                    $("#noticia > div[data-role=content]").replaceWith(content);
                    var id="noticia" + new Date().getTime();
                    $("#noticia").attr("id",id);
                    $.mobile.hidePageLoadingMsg();
                    $.mobile.changePage("#" + id,{ transition: "none", changeHash: false });
                },
                error: function(event) {
                    var title = "Arazoak ditugu konekxioarekin, saiatu geroago berriz";
                    var html = Mustache.to_html(newsTemplate, title);
                    var content = $(html).find("div[data-role=content]")[0];
                    $('body').append(html);
                    $("#noticia > div[data-role=content]").replaceWith(content);
                    var id="noticia" + new Date().getTime();
                    $("#noticia").attr("id",id);
                    $.mobile.hidePageLoadingMsg();
                    $.mobile.changePage("#" + id,{ transition: "none", changeHash: false });
                }
            });
        });

        $("a.newsList").on("click",function(event) {
            event.preventDefault();
            loadList(event);
        });

        $(".spanish").on("click", function(event) {
            jQuery.i18n.properties({
                name:'texts', 
                path:'lang/', 
                mode:'both',
                language:'es_ES',
                encoding: 'ISO-8859-1',
                callback: function() {
                    $.mobile.changePage("#home",{ transition: "none", changeHash: false });
                    $(".i18n-text").each(function(index){
                        var id = $(this).attr("id");
                        $(this).html(eval(id));
                    }); 
                }
            });
        });

        $(".euskera").on("click", function(event) {
            jQuery.i18n.properties({
                name:'texts', 
                path:'lang/', 
                mode:'both',
                language:'eu_ES',
                encoding: 'ISO-8859-1',
                callback: function() {
                    $.mobile.changePage("#home",{ transition: "none", changeHash: false });
                    $(".i18n-text").each(function(index){
                        var id = $(this).attr("id");
                        $(this).html(eval(id));
                    }); 
                }
            });
        });

        $("input[data-type=search]").on("keydown",function(event) {
            if (event.keyCode==13) {
                event.target.href="http://www.avisosneiker.com/?s=" + $("input[data-type=search]:visible").val() +"&submit=Buscar&json=1&count=8";
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
            $.mobile.changePage("#" + event.currentTarget.id + "List",{ transition: "none", changeHash: false }); 
            window.location.hash=event.currentTarget.id;
            if (event.currentTarget.id != "estaciones") {
                $("a.newsList:visible").each(function() {
                    var children = $(this).children().length;
                    var child = $(this).children()[0];

                    $(this).html("");
                    if (children > 0) {
                        $(this).html(child);
                    }
                    var id = $(this).attr("id");
                    $(this).append(eval(id));
                });
            }
        });

        $("div[data-role=header] #logo").on("click", function(event){
            if ($("#home:visible").length == 0) {
                $.mobile.changePage("#home",{ transition: "none", changeHash: false });
            }
        });
    });