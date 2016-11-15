var iLive = 0; // sekundites aeg, pildi uuendamise sagedus
var bCall = true;
var iWaitID = 0;
var iW = 0;
var iH = 0;
var bImageError = false;
var bImageBlink = true;
var lImageLoad = 0;
var lLoadTimerID = 0;
// var sFG_URL = null;				// siin peab olema FG URL
var sBG_URL = null;				// siin peab olema BG URL
var lDrawTimerID = 0;			// see on timer, mis käivitab järgmise pildi
var FG = null;
var jama = 0;
var bBGImageLoad = true;
var iFGImageLoad = 0; // !bIE;
var bNewLoadStarted = false;
var dragStart = 0;   
var SelectedBox = null;

var ContextMenuNr = 0;
var ContextMenu_x = 0, ContextMenu_y = 0;
var ContextMenu = null;
var iSource = 0;
var nTimeOut = 0;
var bFirstDraw = true;
var iMouseX = -1;
var iMouseY = -1;
var bMeasurement = false;
var bMozillaB = true;
var bLiveStop = false; // sellega saab live joonistamine panna ootele
var sComment = null;
var xmlhttp = null;
var bPopUp = true;
var OldCursor = null;
var aMap = null;
function getTiledMap(){ return aMap;}

setMapsVisibility( false);
var WF = getObject( "WaitForm");
if( WF ) setVisible( WF, true);
bBGImageLoad = true;

window.onload = window_onLoad;

function window_onLoad( evt)
{
	// Siia jõuab siis kui pildid on juba laetud
	var sURL = window.location.href;
	iW = getParam( sURL,  "WIDTH");
	iH = getParam( sURL,  "HEIGHT");
	var bPhone = ( top.isPhone)? top.isPhone(): false;
	if( !bPhone && ( iW != getWindowWidth() || iH != getWindowHeight()) ){
//		if( iW > 0 ) logServlet( "map_onload " + bPhone + " " + iW + " " + getWindowWidthC() + " " + iH + " " + getWindowHeightC() )
		window.location.href = getNewURL( getWindowWidth(), getWindowHeight());
	}else{
	 	bCall = false; // lubame kasutaja tegevust
		FG = window; 
		Tooltip = document.getElementById( "Tooltip");
		if( Tooltip ) iTooltipH = getObjectHeight( Tooltip);

//		if( window.isTallinn && !isTallinn() ) form_win = parent.DataFrame;
//		alert( "form_win " + form_win + window.map_onload);
		document.oncontextmenu = document_onContextMenu;
		
		if( window.window_onHammerLoad ){
			window.window_onHammerLoad()
		}else if( isIE8() ){
			document.onclick = document_onClick;
			document.onmousewheel = rollMouse;
			document.onmouseout = document_onMouseLeave;
			document.onmousedown = document_onMouseDown;
			document.onmousemove = document_onMouseMove;
        	document.onmouseup = document_onMouseUp;
//        	document.attachEvent( "onkeyup", document_onKeyPress);
        	document.onkeypress = document_onKeyPress;
		}else{
			document.onclick = document_onClick;
//			document.onkeypress = document_onKeyPress;
			document.addEventListener( "mousemove", document_onMouseMove, false); 
			if( isFF() ){
				window.addEventListener( "scroll", document_onScroll, false);
				window.addEventListener( "DOMMouseScroll", rollMouse, false); 
			}else 
				window.addEventListener( "mousewheel", rollMouse, false); 
			document.addEventListener( "mouseout", document_onMouseLeave, false); 
			document.addEventListener( "mousedown", document_onMouseDown, false); 
			document.addEventListener( "mouseup", document_onMouseUp, false);
			document.ondragstart = canceldefault;
//			document.addEventListener( "touchstart", document_onTouchStart, false);
//			document.addEventListener( "touchend", document_onTouchEnd, false);
			if( isSafari() ){ // ei tööta
				document.addEventListener( "mouseDragged", document_onMouseDragged, true); 
			}
			getObject( "markers").addEventListener( "mousedown", document_onMouseDown, true);
		}
		if( !bPhone ){
			window.onresize = window_resize;
		}
		var Img = window.document.images['MapBGFrame'];
		if( Img ) if( window.resetMap ) resetMap( Img.src, null);

		var WF = getObject( "WaitForm");
		if( WF ) setVisible( WF, false);
		refresh();
		if( window.map_onload ) window.map_onload( evt);
		setLiveRedraw();
		setCursor( null);
		OldCursor = null;
/*	 	var sMsg = "browser support: \n mouseenter:" + isMouseEventSupported("mouseenter") + 
 			"\n touchstart:" + isMouseEventSupported("touchstart") + 
 			"\n touchstart:" + isMouseEventSupported("touchstart") + 
	 		"\n mousedown:" + isMouseEventSupported("mousedown");
	 	logServlet( sMsg);
	 	sMsg = "browser support: geolocation:" + (navigator.geolocation != null);
	 	logServlet( sMsg);
	 	if( navigator.geolocation ){
	 		navigator.geolocation.getCurrentPosition( function( position) {   
	 			logServlet( "coords : " + position.coords.latitude + " " + position.coords.longitude);   
	 		});  
	 	}*/
		if( parent == window ) window.onunload = window_onUnload;
	}
	return false;
}
function document_onScroll( evt)
{
//	alert( "onScroll")
	window.scrollTo( 0, 0);
	return exitEvent( evt);
}
function document_onMouseDragged( evt)
{
	alert( "onMouseDragged")
}
function getNewURL( iW, iH)
{
	var sURL = window.location.href;
	var i = sURL.indexOf( '?');
//	if( i > 0 ) sURL = sURL.substring( 0, ++i);
	sURL = removeParam( sURL, "WIDTH");  // milleks? see teeb topelt väljakutse
	sURL = removeParam( sURL, "HEIGHT");
	return sURL + "&WIDTH=" + iW + "&HEIGHT=" + iH;
}
function canceldefault(){ return false;}
var bWindowReady = true;
function window_onUnload()
{
	clearTooltip();
	setLiveStop( false);
	if( lDrawTimerID != 0 ) clearTimeout( lDrawTimerID);
	closeFormWindows();
	bWindowReady = false;
	if( window.map_onunload ) window.map_onunload();
	SubmitInput( 99, 0, 0, 0, 0); 
}
function form_onunload( aWin)
{
	setLiveStop( false);
//	if( window.release_markers ) window.release_markers();
	var aFormName = getWindowObject( aWin, "REQUEST");
// alert( "close " + aFormName.value);
	unloadFormWindow( aWin);
 	if( aFormName ){
 		sComment = aFormName.value;
 		if( sComment == "QueryForm" ){
 			aFormName = getWindowObject( aWin, "XSL");
 			if( aFormName ) sComment = aFormName.value;  
 		}
 		SubmitInput( 9, 0, 0, 0, 0); 
 		sComment = "";
 		return true;
 	}
 	return false;
}
function setLiveStop( b)
{
// alert( "live stop " + b);
	bLiveStop = b;
/*	if( !bLiveStop && sFG_URL != null ){
		iLive = getParam( sFG_URL, "LIVE");
		if( iLive > 0 ) redrawMapWait( 100); 
	} */
}
function getLiveStop()
{
	return bLiveStop;
}
function window_resize( evt) 
{
	if( iWaitID != 0 ) window.clearTimeout( iWaitID);
	iWaitID = window.setTimeout( "window_resized()", 1000); // 1s
	return false;
}
function window_resized( evt) 
{
	if( iWaitID != 0 ) window.clearTimeout( iWaitID);
	iWaitID = 0;
 	var iDW = iW - getWindowWidthC(); if( iDW < 0 ) iDW = -iDW;
	var iDH = iH - getWindowHeightC(); if( iDH < 0 ) iDH = -iDH;
 	if( iDW >= 3 || iDH >= 3 ){
// 		closeDataForm();
 		if( parent.parent.setMainHeight ) parent.parent.setMainHeight();
		window.location.href = getNewURL( getWindowWidthC(), getWindowHeightC());
	}
	return false;
}
function onImageLoad( evt)
{
	if( isIE6()) window.status = "onload";
	var aImg = getEventObject( evt);
	bBGImageLoad = false;
//	if( lImageLoad > 4 ) logServlet( "Kaarti laaditi: " + lImageLoad + " " + sBG_URL);
	if( lLoadTimerID > 0 ){  clearTimeout( lLoadTimerID); lLoadTimerID = 0;}
/*	if( lImageLoad > 5 ){
		var WF = getObject( "WaitForm");
		if( WF ){
			setVisible( WF, true);
			setObjectHTML( WF, "<b>Kaarti laaditi " + lImageLoad + " s</b>");
			setTimeout( "clearErrorMsg()", 5000);
		}
	}else{
		clearErrorMsg();
	}*/
//	alert( sBG_URL + " " + aImg );
	if( sBG_URL ) setBG();
	else if( aImg) setVisible( aImg, true);
	if( !setMapsVisibility( true)){
//		alert( bBGImageLoad + " bg not " + iFGImageLoad );
//		if( isIE6()) window.status = "not " + bBGImageLoad + iFGImageLoad;
	}
	return false;
} 
function onImageError( evt)
{
//	alert( "image error");
	bBGImageLoad = false;
	if( lLoadTimerID > 0 ){  clearTimeout( lLoadTimerID); lLoadTimerID = 0;}
	var aImg = getEventObject( evt);
//	logServlet( "Ka: " + evt.id + " " + evt.type + " url=" + aImg.src);
/*	var WF = getObject( "WaitForm");
	if( WF ){
		setVisible( WF, true);
		setObjectHTML( WF, "Kaardi laadimisel tuli viga.");
	}
	setTimeout( "clearErrorMsg()", 5000); */
	setBG();
	if( !setMapsVisibility( true)); // window.status = "not " + bBGImageLoad + iFGImageLoad;
	return true;
}
function onFGImageLoad( evt)
{
	var aImgFG = getEventObject( evt);
	setObjectLeft( aImgFG, 0);
	setObjectTop( aImgFG, 0);
	--iFGImageLoad;
	if( !setMapsVisibility( true)){
//		alert( bBGImageLoad + " fg not " + iFGImageLoad );
		window.status = "not " + bBGImageLoad + iFGImageLoad;
	}
	return false;
} 
function onFGImageError( evt)
{
	--iFGImageLoad;
	setMapsVisibility( true);
	window.status = "Eespildi laadimisel tuli viga!";
	return true;
}
function setMapsVisibility( bVisible)
{
	var WF = getObject( "WaitForm");
	if( bVisible && !bBGImageLoad && iFGImageLoad <= 0 ){
//  alert( "visible");
		var iMaps = 0, iNoMaps = 0;
		if( WF ) setVisible( WF, false);
/*		var aImages = document.images;
		for( var i = 0; i < aImages.length; ++i){ 
			var aImage = aImages[ i];
			if( aImage.id.indexOf( "MapFG") >= 0 ){
				var sURL = aImage.src;
				if( sURL.indexOf( "blank.gif") < 0){
					var iL = getParam( sURL, "left");
					if( iL < 0 ) iL = 0;
					var iT = getParam( sURL, "top");
					if( iT < 0 ) iT = 0;
					var iW = getParam( sURL, "width");
					var iH = getParam( sURL, "height");
					setObjectLeft( aImage, iL);
					setObjectTop( aImage, iT);
					setObjectWidth( aImage, iW);
					setObjectHeight( aImage, iH);
				}
				setVisible( aImage, bVisible);
				window.status = aImage.id;
//				if( bVisible)
					++iMaps;
			}// else if( aImage.id.indexOf( "MapBG") >= 0 ) setVisible( aImage, true);
		}*/
		window.status = "Done ";
//		alert( bVisible + " " + iMaps + " " + iNoMaps + aImages.length);
		if( WF ) setVisible( WF, false);
/*		else{
			if( lImageLoad > 5 ){
				if( WF ){
//							setVisible( WF, true);
						setObjectHTML( WF, "<b>Kaarti laaditi " + lImageLoad + " s</b>");
						setTimeout( "clearErrorMsg()", 5000);
					}
				}else{
					setVisible( WF, false);
				}
			}
		}*/
		if( sBG_URL ) redrawMapNew();
		var aMapView = getObject( "MapView");
		if( aMapView ){	
			if( aMapView.src.indexOf( "blank.gif") > 0 ){ 
			}else{
				setVisible( aMapView, true);
			}
		}	
/*		if( window.onMapRedraw ){
			onMapRedraw();
			if( isReady( form_win) ){
				if( form_win.set_focus ){
					form_win.set_focus();
				}else form_win.focus();
			}
		}else{
//			alert( form_win);
			if( isReady( form_win) ){
				if( form_win.onMapRedraw ) form_win.onMapRedraw();
				else{
					if( form_win.set_focus ){
						form_win.set_focus();
					}else form_win.focus();
				}
			}
			drawDrawing();
		}
		setLiveRedraw(); */
	}else if( !bVisible){
		var aImg = getObject( 'MapBGFrame');	
		if( aImg ) bBGImageLoad = true;
		else{
			bBGImageLoad = false;
		}
/*		aImg = getObject( 'MapFGFrame');
		if( aImg ) iFGImageLoad = 1; // igaks juhuks 
		else */
		iFGImageLoad = 0;
		if( WF ){
//			if( window.isTallinn && isTallinn() );
//			else setObjectHTML( WF, "Palun oodake ...!");
			setVisible( WF, true);
// alert( "Palun " + bBGImageLoad)
		}
		if( sBG_URL ){
			if( window.isTallinn && isTallinn() ){
			}else{
				bImageBlink = true;
				if( lLoadTimerID > 0 ){  clearTimeout( lLoadTimerID); lLoadTimerID = 0;}
				lLoadTimerID = setTimeout( "drawLoadImage()", 1000);
			}
		}
//		alert( bVisible + " " + bBGImageLoad + " " + iFGImageLoad);
	}else{
//		alert( bVisible + " " + bBGImageLoad + " " + iFGImageLoad);
		return false;
	}
	return true;
}

function clearErrorMsg()
{
	var WF = getObject( "WaitForm");
	if( WF ) setVisible( WF, false);
}
function loadImage() // see on ühine mõlemale
{
	lImageLoad = 0;

	iFGImageLoad = 0;
	setMapsVisibility( false);
/*	if( !isIE6() ){
		Img = getObject( "MapFGFrame");
		if( Img ) bFGImageLoad = true;
	}*/
//	alert( "BG=" + bBGImageLoad + " FG=" + iFGImageLoad);
}
function isImageLoad()
{
	return false; // bBGImageLoad; see plokib
}
function drawLoadImage()
{
	if( bBGImageLoad ){
		++lImageLoad;
		var WF = getObject( "WaitForm");
		if( WF ){
			setVisible( WF, true);
			if( window.isTallinn && isTallinn() );
			else if( lImageLoad > 2 ){
				if( bImageBlink )
					setObjectHTML( WF, "<b>Kaarti laaditakse ... " + lImageLoad + "s</b>");
				else
					setObjectHTML( WF, "<b>...</b>"); 
				bImageBlink = !bImageBlink;
				lLoadTimerID = setTimeout( "drawLoadImage()", 1000);
			}
		}
	}else{
	 	if( lLoadTimerID > 0 ){ clearTimeout( lLoadTimerID); lLoadTimerID = 0;}
	}
}
function refresh()
{
	SubmitInput( 0, 0, 0, 0, 0);
// mida see peaks ikkagi tegema - see uurib, kas peab pilti uuendama
}
function reloadMap()
{
	SubmitInput( 1, 0, 0, 0, 0);
	// mida see peaks ikkagi tegema - see paneb ise kõik püsti
}
function drawMap()
{
	SubmitInput( 2, 0, 0, 0, 0);
// mida see peaks ikkagi tegema - see paneb ainult eespildi uuenema ( kas kõik?)
// praegu peavad ikkagi bitid olema püsti. Mis on siis selle mõte
// selle teeb ka refresh ära
}
function drawMapNew( response)
{
	iFGImageLoad = 0;
	var Nodes = getNodes( response, "FG_URL");
	if( Nodes && Nodes.length > 0 ){
//		window.status = "Eespilti uuendatakse!";
		var ImgBG = getObject( "MapBGFrame");
		var ilist = document.images;
		var ii = 0;
		
		for( var i = 0; i < ilist.length; i++) {
    		if( ilist[i].id == "MapFGFrame" ) {
    			var sFG_URL = getNodeValue2( Nodes.item( ii)); 
    			if( sFG_URL > "" ){
    				setFGImage( ImgBG, ilist[i], sFG_URL);
    			}
    			if( ++ii >= Nodes.length) break;
    		}
    	}
		if( ii < Nodes.length ){
			var aImgSVG = getObject( "MapSVGFrame");
			if( aImgSVG ) aImgSVG.data = getNodeValue2( Nodes.item( ii))
//			else alert( "drawMapNew " + getNodeValue2( Nodes.item( ii)));
		}
//		onFGImageLoad(); see on jam, sest peaks tulema brauserist
/*		if( isReady( form_win) ){
			if( form_win.isWindowMinimized ){
				if( !form_win.isWindowMinimized() ){
					if( form_win.onMapRedraw ) form_win.onMapRedraw();
				}
			} 
		}
		if( isReady( form_win)){
			setFocus( form_win);
//			alert( "focus");
		}*/
	}
	if( iFGImageLoad > 0 ){
		var WF = getObject( "WaitForm");
		if( WF ){
//			if( window.isTallinn && isTallinn() );
//			else setObjectHTML( WF, "Palun oodake ...!");
			setVisible( WF, true);
		}
//		alert( "FG =" + iFGImageLoad + bBGImageLoad + lImageLoad );
//		clearDrawing();
		var OCanvas = document.getElementById("canvas");
		if( OCanvas ){
			setObjectLeft( OCanvas, 0);
			setObjectTop( OCanvas, 0);
		}
	}
	var aLive = getNode( response, "Live");
	if( aLive ){
		iLive = getNodeValue( response, "Live");
		setLiveRedraw();
	}
//	alert( bBGImageLoad + " set " + iFGImageLoad );
}
function setFGImage( ImgBG, ImgFG, sFG_URL)
{
	if( ImgBG ){
		if( isIE6() ){
			ImgFG.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + 
				sFG_URL + "',sizingMethod='image');";
			ImgFG.src = ImgFG.src;
//			setTimeout( "onFGImageLoad()", 1000);
		}else{
			if( sFG_URL != "images/blank.gif"){
				++iFGImageLoad;
//				alert( sFG_URL);
			}
			ImgFG.src = sFG_URL; // + "&ID=" + (++jama); // see jama peab olema mõlemal poolel !!!
		}
	}else{
		if( sFG_URL != "images/blank.gif") ++iFGImageLoad;
		ImgFG.src = sFG_URL ; //+ "&ID=" + (++jama); // see jama peab olema mõlemal poolel !!!
	}

}
function redrawMap()
{ 
try{
	if( isVisible( SelectedBox) || dragStart > 0 || isVisible( ContextMenu) || isMenuVisible() ){
		if( lDrawTimerID > 0 ){  clearTimeout( lDrawTimerID); lDrawTimerID = 0;}
		lDrawTimerID = setTimeout( "redrawMap()", 5000); // 5s
		return;
	}
	if( !isWindowMinimized() ) drawMap();
	setLiveRedraw();
}catch( E){
	alert( "Redraw error: " + E.toString());
}
}
function redrawMapNew( )
{ 
	// response
	// see tekkis tile kaardi tõttu, sest on mitmete kaartide uuendus
// seda tohib välja kutsuda üksnes üks kord
//	logServlet( "redrawMapNew " + form_win); //  + " " + window.resetMap);
//	if( response )	
//	if( window.resetMap ) resetMap( sBG_URL, response);
	var aMarkers = getObject( "markers");
	if( aMarkers ){
		setObjectLeft( aMarkers, 0);
		setObjectTop( aMarkers, 0);
	}
	if( window.onMapRedraw ){
		onMapRedraw();
		if( isReady( form_win) ){
			if( form_win.set_focus ){
				form_win.set_focus();
			}else form_win.focus();
		}
	}else{
		if( isReady( form_win) ){
			if( form_win.onMapRedraw ) form_win.onMapRedraw();
			else{
				if( form_win.set_focus ){
					form_win.set_focus();
				}else form_win.focus();
			}
		}
	}
	drawDrawing();
	setLiveRedraw(); 
	if( window.onRedrawMagGlass ) onRedrawMagGlass();
/*	var aMagGlass = getObject( "MagGlass");
	if( aMagGlass ){
		alert( getObjectLeft( aMagGlass))
		var sURL = aMagGlass.src;
		sURL = removeParam( sURL, "Cache");
		aMagGlass.src = sURL + "&Cache=" + ( new Date()).valueOf();  
	}*/
}
function setLiveRedraw()
{
//	if( sFG_URL == null ) sFG_URL = getValue( "ID_FG_URL");
	if( lDrawTimerID > 0 ){  clearTimeout( lDrawTimerID); lDrawTimerID = 0;}
	if( iLive > 0 ){
		lDrawTimerID = setTimeout( "liveMap()", iLive * 1000); 
	}
}
function setLive( iLiveTime) // uuendamissagedus sekundites
{
	iLive = iLiveTime;
}
function liveMap()
{ 
try{
	if( lDrawTimerID > 0 ){  clearTimeout( lDrawTimerID); lDrawTimerID = 0;}
	if( isVisible( SelectedBox) || dragStart > 0 || isVisible( ContextMenu) || isMenuVisible() ||
		isWindowMinimized() || bLiveStop ){
		lDrawTimerID = setTimeout( "liveMap()", 5000); // 5s
	}else SubmitInput( 40, 0, 0, 0, 0);
//	setLiveRedraw();
}catch( E){
	alert( "Redraw error: " + E.toString());
}
}
function redrawMapWait( iWait)
{
	if( lDrawTimerID > 0 ){  clearTimeout( lDrawTimerID); lDrawTimerID = 0;}
	lDrawTimerID = setTimeout( "redrawMap()", iWait); // ms
}
var aMsgs = [];		// buffer for unsent messages
var iSendMsg = 0;	// if > 0 then waiting the next sending starts soon
function logServlet( sMsg)
{
//	var n = aMsgs.length;
//	aMsgs[ n] = sMsg;
//	if( iSendMsg == 0 ) sendMsgs();
	return requestServlet( "REQUEST=Log&Comment=" + sMsg, false, null);
}
function sendMsgs()  
{
	iSendMsg = 0;
	var n = aMsgs.length;
	for( var i = 0; i < n; ++i ){
		n = aMsgs.length;
		if( n > 0 ){
			sComment = aMsgs[ 0];
			if( bCall ){
				sComment = null;
				iSendMsg = setTimeout( "sendMsgs()", 1000);
				break;
			}else{
				callServlet( 43, 0, 0, 0, 0, false)
				aMsgs.splice( 0, 1);
			}
		}else break;
	}
}
function onLinkClick( iLayerID, iType)
{
	return callServlet( 41, 0, 0, iLayerID, iType, false);
}
function SubmitInput( iOper, iX, iY, iW, iH)
{
	for( var i = 3; --i >= 0; ){
		if( callServlet( iOper, iX, iY, iW, iH, true) ) return true;
		if( iOper == 99 ) break;
		if( bCall ) sleep( 100);
	}
//	alert( "not work " + iOper);
	return false; 
}
function callServlet( iOper, iX, iY, iW, iH, bASync)
{
	if( bCall && ( iOper >= 40 && iOper <= 50) && iOper != 99 ){ // && iOper != 99 && iOper != 9 && iOper != 43 ){
		return false; 
	}
	if( ( iOper < 40 || iOper > 50) && iOper != 99  && iOper != 9 ){
		bCall = true;
	}
	var sParam = "REQUEST=MapInput&ShowMapZoom=" + (iOper* 100 + getState());
	sParam = sParam + "&ShowMapX=" + iX;
	sParam = sParam + "&ShowMapY=" + iY;
	sParam = sParam + "&ShowMapW=" + iW;
	sParam = sParam + "&ShowMapH=" + iH;
	sParam = sParam + "&ShowMapRet=0";
//	alert( iOper + " " + getState());
	if( sComment != null ){
		sParam = sParam + "&Comment=" + sComment;//
		sComment = null;
//	 	alert( "ikka " + sParam);

	}
//	sURL = sURL + "&Cache=" + ( new Date()).valueOf(); //( ++jama);
	if( iOper != 50 && isReady( form_win) ){
		if( form_win.submitInput ) sParam = sParam + form_win.submitInput();	
	}
//	alert( sParam)
	var bRet = requestServlet( sParam, bASync)
	if( iOper == 99 ){
		bCall = false;
		if( isIE6() ) xmlhttp = null; 
		return false;
	} 
	return bRet;
}
function formServlet( sForm, sParam)
{
	if( bCall ) return false; 
	bCall = true;
	return requestServlet( "REQUEST=MapInput&Form=" + sForm + "&" + sParam, false);
}
var aResponse = null;
function getResponse()
{ 
	return aResponse;
}
function requestServlet( sParam, bASync, aCallBack)
{
	try{
		var xmlhttp = null;
// code for Mozilla, IE7, etc.
		if( xmlhttp == null ){
			if( isIE6() ){
				if( window.ActiveXObject ){
					xmlhttp = new ActiveXObject( "Microsoft.XMLHTTP");
				}
			}else if (window.XMLHttpRequest){
				xmlhttp = new XMLHttpRequest();
//				alert( "new");
			}else if( window.ActiveXObject ){
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			}
			if( xmlhttp == null ){
				alert( "no xmlhttp");
			 	return;
			}
		}
		if( aCallBack ) bCall = true;
		if( bCall){
			var sCursor = getCursor();
			if( sCursor != "wait" ){
				OldCursor = sCursor;
				setCursor( "wait");
			}
			setLiveStop( true);  // peatab pildi live uuendamise
		}
		var sURL = getURL();
		if( isIE6()){
			xmlhttp.open( "GET", sURL + "?" + sParam + "&Cache=" + ( new Date()).valueOf(), true);
			xmlhttp.onreadystatechange = state_Change;
			xmlhttp.setRequestHeader( "Content-Type", "text/xml;charset=ISO-8859-15");
			xmlhttp.send( null);
			return true;
		}else{
			if( isFF() ) sParam += "&timestamp=" + new Date().getTime(); 
			xmlhttp.open( "POST", sURL, bASync);
			xmlhttp.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded");
			if( bASync ){	
				aResponse = null;
				xmlhttp.onreadystatechange = function (){ state_Change( xmlhttp, aCallBack)};
				xmlhttp.send( sParam);
				return true;
			}else{
				xmlhttp.send( sParam);
				while( true ){ 
					try {
					    	var response = xmlhttp.responseXML;
					    	break;
					    }
					catch(e) {
					    var response="Aborted";
					}					
				}
				if( xmlhttp.status == 200 ){
					aResponse = xmlhttp.responseXML;
					var aRet = getNode( aResponse, "ShowMapRet");
					if( aRet ) responseInput( xmlhttp); else return true; // nii ei tohiks muidugi teha, kuid ...
				}
			}
		}
	}catch( E){
		logServlet( "Input send/return Error: " + E.toString() + " " + bASync + sParam + xmlhttp);
		xmlhttp = null;
		bCall = false;
	}
	return false;
}
function state_Change( xmlhttp, aCallBack)
{
try{
	if( xmlhttp ){
		if( xmlhttp.readyState == 4 ){
  			if( xmlhttp.status == 200 ){
				aResponse = xmlhttp.responseXML;
  				if( aCallBack ){
  					bCall = false;
  					if( OldCursor ){
  				 		setCursor( OldCursor);
  				 		OldCursor = null;
  					}
  					setLiveStop( false);
 					aCallBack( aResponse);
  				}else{
  					responseInput( xmlhttp);
  				}
  	    		bCall = false;
     		}else{
     			logServlet( "Problem retrieving XML data: xmlhttp.status=" + xmlhttp.status);
    		}
  		}
	}else
		logServlet( "xmlhttp is null")
}catch( E){
//	logServlet( "Problem retrieving XML data: status=" + E.toString());
	bCall = false;
}
}
function showComment( sComment)
{
	if( sComment ){
		var aCommentForm = getObject( "CommentForm");
		if( aCommentForm ){
			setObjectHTML( aCommentForm, sComment);
			var iWW = getWindowWidth();
			var iWH = getWindowHeight();
			var iW = aCommentForm.scrollWidth; 
			var iH = aCommentForm.scrollHeight; 
			var iX = (iWW - iW) / 2; 
			if( iX < 0 ) iX = 0;
			var iY = (iWH - iH) / 2; 
			if( iY < 0 ) iY = 0;
			setObjectLeft( aCommentForm, iX);
			setObjectTop( aCommentForm, iY);
			setVisible( aCommentForm, true);
			setTimeout( "clearComment()", 5000);
		}
	}
}
function showError( sError)
{
	if( sError ){
		var aErrorForm = getObject( "ErrorForm");
		if( aErrorForm ){
			setObjectHTML( aErrorForm, sError);
			var iWW = getWindowWidth();
			var iWH = getWindowHeight();
			var iW = aErrorForm.scrollWidth; 
			var iH = aErrorForm.scrollHeight; 
			var iX = (iWW - iW) / 2; 
			if( iX < 0 ) iX = 0;
			var iY = (iWH - iH) / 2; 
			if( iY < 0 ) iY = 0;
			setObjectLeft( aErrorForm, iX);
			setObjectTop( aErrorForm, iY);
			setVisible( aErrorForm, true);
			setTimeout( "clearError()", 10000);
		}
	}
}
function clearComment()
{
	var aCommentForm = getObject( "CommentForm");
	if( aCommentForm ) setVisible( aCommentForm, false);
}
function clearError()
{
	var aErrorForm = getObject( "ErrorForm");
	if( aErrorForm ) setVisible( aErrorForm, false);
}
function responseInput( xmlhttp)
{
try{
	var response = xmlhttp.responseXML;
	var iRet = Number( getNodeValue( response, "ShowMapRet")); 
	var id = 0;
	var iMapOper = Number( getNodeValue( response, "MapOper"));
	if( iRet == 100 ){ // see on Google pärast, et tuleks totaalne taasesitus
		window.location.href = window.location.href;
		return false;
	}else if( iRet == 161 ){
		sComment = getNodeValue( response, "Comment");
		return true;
	}else if( iRet == 162 ){
		if( window.setCoord ) setCoord( response);
		iRet = -2; // midagi neutraalset
	}else if( iRet == 192 ){
		sComment = getNodeValue( response, "Comment");
		var sURL = getRequestURL( sComment);
		var iW = getNodeValue( response, "ShowMapW");
		var iH = getNodeValue( response, "ShowMapH");
		openDataFormReal( sURL, "ClickForm", iW, iH, false, true);
//		alert( iW + " " + iH)
		iRet = -2; // midagi neutraalset
	}else if( iRet == 193 ){ // ( paneb tabelis rea paika) ei tee nii
		sComment = getNodeValue( response, "Comment");
		var iId = getNodeValue( response, "ShowMapX");
	}else if( iRet > 0 && (iRet&128) == 128 ){
		closeDataForm();
		iRet -= 128;
	}
	if( (iRet >= 4 && iRet <= 6) || (iRet >= 12 && iRet <= 14) || iRet == 20  || iRet == 22 || iRet == 52 ){
		var Ms = getNode( response, "ShowMarkers");
		if( Ms ){
			var Mxs = getNodeValues( Ms, "coord", "x");
			var Mys = getNodeValues( Ms, "coord", "y");
			var Tooltips = getNodesValues( Ms, "tooltip");
//			if( Tooltips ) window.createMarkersT( Mxs, Mys, Tooltips);	else 
			if( window.createMarkers ) window.createMarkers( "Marker", Mxs, Mys, Tooltips);
			else if( window.create_markers ) window.create_markers( Mxs, Mys);
		}else if( iMapOper != 50 ){ // võib-olla on see ajutine ja SKIS tarvis, et Tooltip ei kaotaks markereid
		//	if( iMapOper == 9 && isReady( form_win) ){
		//	}else 
			if( window.releaseMarkers ) window.releaseMarkers();
			else release_markers();
		}
		if( isReady( form_win) ) if( form_win.responseInput ) sURL = sURL + form_win.responseInput();

		iRet -= 4;
		if( iRet == 0 ) iRet = -1;
// alert( "Ret = " + iRet);
	}else if( iRet == 1 || iRet == 9 ){
//		release_markers();
	}
	if( iMapOper != 50 ){ 
		var WF = getObject( "WaitForm");
		if( WF ) setVisible( WF, false);
	}
//	if( lDrawTimerID > 0 ){  clearTimeout( lDrawTimerID); lDrawTimerID = 0;}
//	if( iRet == 0 ) 
//	var sFG = getNodeValue( response, "FG_URL");
	var sBG = getNodeValue( response, "BG_URL");
	if( sBG ){
//		alert( sBG);
//		logServlet( sBG);
		loadImage(); // setMapsVisibility( false);
	}
	drawMapNew( response);
	if( getNode( response, "TileMap") && classMap ){
		aMap = new Map( response);
	}else if( sBG ){
		if( iRet == 1 ) aMap = null;
//		logServlet( "Map to null");
	}
	if( sBG ){
		sBG_URL = sBG;
		if( sBG_URL == null ){ alert( "Jama"); return;}
		var l = window.document.images.length, j = 0;
		for( var i = 0; i < l; ++i ){
			var Img = window.document.images[ i];
			if( Img.id == "MapBGFrame" ){
				setVisible( Img, false);
				if( j == 0 ){
					++j;
					if( Img){
//						Img.src = sBG_URL; 
//						if( isIE6() ) Img.src = sBG_URL + "&IE6=" + (++jama);
//						else 
						Img.src = sBG_URL; 
					}else{
						alert( "no bg image");
					}
					if( window.resetMap ) resetMap( sBG_URL, response);
				}
			}
		}
//		var Img = window.document.images['MapBGFrame'];
/*		if( sFG != null ){
			var ImgFG = getObject( "MapFGFrame");
		 	if( ImgFG ) setVisible( ImgFG, false);
		}*/
//		loadImage();
	}else{
		Ps = getNodes( response, "bg");
		if( Ps ); else Ps = getNodes( response, "BG_URLs");
		if( Ps ){
//			logServlet( "redraw back");
			var bTest = true;
			sBG_URL = null;
			var l = window.document.images.length;
			var j = 0, i = 0;
			for( ; i < Ps.length; ++i ){
				for( ; j < l; ++j ){
					var aImg = window.document.images[ j];
					if( aImg.id == "MapBGFrame" ){
//						setVisible( aImg, false);
//						aImg.src = "";
						var iLeft = getObjectLeft( aImg);
						var iNewLeft = getNodeChildValue( Ps[ i], "left");
						if( iLeft != iNewLeft )	setObjectLeft( aImg, iNewLeft);
						var iTop = getObjectTop( aImg);
						var iNewTop = getNodeChildValue( Ps[ i], "top");
						if( iTop != iNewTop ) setObjectTop( aImg, iNewTop);
						setObjectWidth( aImg, getNodeChildValue( Ps[ i], "width"));
						setObjectHeight( aImg, getNodeChildValue( Ps[ i], "height"));
						var sNewSrc = getNodeChildValue( Ps[ i], "url");
						if( aImg.src != sNewSrc ) aImg.src = sNewSrc;
						++j;
						if( bTest ){
							if( iLeft != iNewLeft || iTop != iNewTop || aImg.src != sNewSrc  ){
	//							bTest = false
	//							logServlet( iLeft + " " + iNewLeft + " " + iTop + " " + iNewTop + " " + (aImg.src != sNewSrc));
							}
						}
						
						break;
					}
				}
			}
			for( ; j < l; ++j ){
				var aImg = window.document.images[ j];
				if( aImg.id == "MapBGFrame" ) setVisible( aImg, false);
			}
//			if( window.resetMap ) resetMap( sBG_URL, response);
//			alert( i + " " + j + " " + l + " " + Ps.length);
			if( window.resetMap ) resetMap( sBG_URL, response);
			redrawMapNew();
		}else{
			bBGImageLoad = false;
			if( window.resetMap ) resetMap( null, response);
			if( iRet == 1 ) redrawMapNew();
		}
	}
	var aMapView = getObject( "MapView");
	if( aMapView ){		
		var aMapViewNode = getNode( response, "MapView");
		if( aMapViewNode ){
			setVisible( aMapView, false);
			var sURL = getNodeChildValue( aMapViewNode, "image_url");
			
			 
// alert( "MapView.src=" + aMapView.src)
			if( sURL ){
//				alert( sURL);
				aMapView.src = sURL;
				setObjectLeft( aMapView, getNodeChildValue( aMapViewNode, "left"));
				setObjectTop( aMapView, getNodeChildValue( aMapViewNode, "top"));
				setObjectWidth( aMapView, getNodeChildValue( aMapViewNode, "width"));
				setObjectHeight( aMapView, getNodeChildValue( aMapViewNode, "height"));
				setOpacity( aMapView, getNodeChildValue( aMapViewNode, "opacity"));
			}else{
				setVisible( aMapView, false);
				aMapView.src = "images/blank.gif";
			}
		}
	}
	var A = getNode( response, "anchor");
	if( A ){
		createAnchorFromNode( A);
//		if( isReady( form_win) ) if( form_win.createdAnchor ) form_win.createdAnchor();
		drawDrawing();
	}
	if( iRet == 1 ){
		if( window.map_redraw ) map_redraw( response);
		var iDraw = 0;
		if( FG ) ContextMenuNr = 0;
		showComment( getNodeValue( response, "Comment"));
		if( iMapOper == 40 ) setLiveRedraw();
	}else if( iRet == 2 ){
		sComment = getNodeValue( response, "Comment");
// alert( sComment);
		var j = sComment.indexOf( ".html");
		if( j > 0 ){ 
			window.focus();
			window.showModelessDialog( sComment, "HelpForm",
				"dialogHeight:800px; dialogWidth:650px; dialogTop:px; dialogLeft:px; edge:Sunken; center:Yes; help:No; resizable:Yes; status:No;");
		}else if( sComment == "Main"){
			parent.location.href = getRequestURL( "Main");
		}else{
			var sURL = getRequestURL( sComment);
			var iW = getNodeValue( response, "ShowMapW");
			var iH = getNodeValue( response, "ShowMapH");
			openFormWindow( sURL, "ClickForm", iW, iH, false, true);
		}
//		bOnClick = false;
	}else if( iRet == 3 ){
		sComment = getNodeValue( response, "Comment");
		var sURL = getURL() + "?REQUEST=" + sComment;
		var iW = getNodeValue( response, "ShowMapW");
		var iH = getNodeValue( response, "ShowMapH");
		openFormWindow( sURL, "DataReport", iW, iH);
	}else if( iRet == 8 ){ // ka 12
		sComment = getNodeValue( response, "Comment");
		var iW = getNodeValue( response, "ShowMapW");
		var iH = getNodeValue( response, "ShowMapH");
		openDataForm2( sComment, iW, iH);
	}else if( iRet == 9 ){ // 13
		sComment = getNodeValue( response, "Comment");
		var iW = getNodeValue( response, "ShowMapW");
		var iH = getNodeValue( response, "ShowMapH");
		redrawMap();
		openDataForm( sComment, iW, iH);
	}else if( iRet == -1 || iRet == 0 ){
		var sComment = getNodeValue( response, "Comment");
		showComment( sComment);
		if( iMapOper == 0){
			if( window.resetMap ) resetMap( null, response);
			var aLive = getNode( response, "Live");
			if( aLive ){
				iLive = getNodeValue( response, "Live");
				setLiveRedraw();
			}
		}
//		release_markers()
// window.status = "no ShowMap";		
//		if( response.getElementsByTagName( "FG_URL") ) sFG_URL = getNodeValue( response, "FG_URL");
	}else if( iRet == -2 ){
		release_markers()
// window.status = "err ShowMap";		
		ContextMenuNr = 0
	}else if( iRet == 10 ){
		var s = getNodeValue( response, "Comment");
		if( s != null ){
			var sMenu = createContext( s);
			var iX = getNodeValue( response, "ShowMapX");
			var iY = getNodeValue( response, "ShowMapY");
			ContextMenu_show( iX, iY, sMenu); 
		}
	}else if( iRet == 18 ){ // Siin tuleb HTML
		sComment = getNodeValue( response, "Comment");
		showError( sComment);
/*		var iW = getNodeValue( response, "ShowMapW");
		var iH = getNodeValue( response, "ShowMapH");
		if( window.openSubDataForm ) openSubDataForm( getRequestURL( sComment), iW, iH);
		else{
			var s = sComment.indexOf( 'class="err"');
			if( s > 0 ){
				s = sComment.indexOf( ">", s);
				if( s > 0 ){
					s = s + 1;
					var e = sComment.indexOf( "<", s);
					if( e > 0 ) alert( sComment.substr( s, e-s).replace( "&otilde;", "õ"));
				}	
			}
		}*/
		sComment = "";
	}else if( iRet == 20 ){
		sComment = getNodeValue( response, "Comment");
		openSubDataForm( sComment);
/*	}else if( iRet == 49 && parent.DataFrame ){ 
		sComment = getNodeValue( response, "Comment");
//		redrawMap();
		if( sComment > "" ){
			if( parent.DataFrame.setDataFrameURL )
				parent.DataFrame.setDataFrameURL( getURL() + "?REQUEST=" + sComment);
			else
				setWindowURL( parent.DataFrame.window, getURL() + "?REQUEST=" + sComment);
		}else if( parent.DataFrame.saveData ) parent.DataFrame.saveData( 0);
//		refreshWindow( parent.DataFrame);*/
	}else if( iRet == 50 ){
//		if( iTooltipID < 0 ){
			var sTooltip = getNodeValue( response, "Comment");
			var iW = getNodeValue( response, "ShowMapW");
			showTooltip( sTooltip, iW);
			iTooltipID = 0;
//		}
	}else if( iRet == 98 || iRet == 48 ){ //
		sComment = getNodeValue( response, "Comment");
		if( parent.DataFrame ){

			if( sComment != null ){
				if( window.openDataFormInFrame ){
					var iW = getNodeValue( response, "ShowMapW");
					if( iW <= 0 ) iW = 200;
					window.openDataFormInFrame( getURL() + "?REQUEST=" + sComment, iW);
				}else{
					if( getWindowObjectWidth( parent.DataFrame) > 0 && parent.DataFrame.setDataFrameURL ){
						parent.DataFrame.setDataFrameURL( getURL() + "?REQUEST=" + sComment);
					}else if( parent.setDataForm){
						setDataForm( getURL() + "?REQUEST=" + sComment);
					}else{
						var iW = getNodeValue( response, "ShowMapW");
						if( iW <= 0 ) iW = 200;
						parent.document.getElementById( 'FS').setAttribute( "cols", iW + ",*");
						setDataForm( parent.DataFrame.window);
						setWindowURL( parent.DataFrame.window, getURL() + "?REQUEST=" + sComment);
					}
				}
			}else if( isReady( form_win)){
				form_win.saveData( 0);
			}else if( parent.DataFrame.saveData ) parent.DataFrame.saveData( 0);
		}else if( sComment ){
			openDataForm2( sComment, 0, 0);
		}else if( isReady( form_win)){
			form_win.saveData( 0);
		}
	}else if( iRet == 97 || iRet == 99 ){
		reloadMap();
	}else if ( iRet == -99 ){ // session continue alert
		var sAlert = getNodeValue( response, "Comment");
		alert( sAlert);
	}else{
alert( "Submit ret = " + String( iRet) + " unknown")
	}
}catch( E){
	window.status = "Input receive Error: " + E.toString() + " ret=" + iRet;
	xmlhttp = null;
}
	if( iRet != 50 ){
		clearTooltip();
//		if( isReady( form_win))
//			if( form_win.saveData ) setFocus( form_win);
	}
	if( iMapOper != 50 ){
		if( isReady( form_win) && !isWindowObjectMinimized( form_win)){
			if( isChrome() ){// Chrome problem
//			   form_win.parent.blur();
//				window.blur(); form_win.focus(); // Chrome problem alert( "form_win");
			}
			form_win.focus();
		}	
	}
/*	if( iMapOper == 0 && ( iRet <= 0 || iRet == 18)){
		if( isReady( form_win) && getWindowURL( form_win).indexOf( "blank.html") >= 0 ){
			alert( iRet + " closeFormWindow")
			closeFormWindow( "DataForm");
		}
	}*/
	if( isIE() ) xmlhttp = null; 
	bCall = false;
	if( OldCursor ){
 		setCursor( OldCursor);
 		OldCursor = null;
	}
	setLiveStop( false);
	return false;
}
function setBG()
{
	if( sBG_URL ){
		var n = window.document.images.length;
		for( var j = 0; j < n; ++j ){
			var aImgBG = window.document.images[ j];
			if( aImgBG.id == "MapBGFrame" ){
				var iL = getParam( sBG_URL, "left")
				if( iL < 0 ) iL = 0;
				var iT = getParam( sBG_URL, "top")
				if( iT < 0 ) iT = 0;
				var iW = getParam( sBG_URL, "width")
				var iH = getParam( sBG_URL, "height")
				setObjectLeft( aImgBG, iL);
				setObjectTop( aImgBG, iT);
				setObjectWidth( aImgBG, iW);
				setObjectHeight( aImgBG, iH);
				setVisible( aImgBG, true);
//				logServlet( iL + " " + iT + " " + iW + " " + iH);
				break;
			}
		}
// alert( " ? " + sBG_URL); 
//		if( !bFGImageLoad ){ // kas taustapilt on olemas
/*			ImgFG = getObject( "MapFGFrame");
			if( ImgFG ){
				setObjectLeft( ImgFG, 0);
				setObjectTop( ImgFG, 0);
				setVisible( ImgFG, true);
			} 
//		}*/
	}else{ // alguses ja taaslaadimisel tuleb siia
/*		var Img = getObject( "MapFGFrame");
		if( Img ){
		 	setVisible( Img, true);
			var FG_URL = getObject( "ID_FG_URL");
			if( FG_URL ) sFG_URL = FG_URL.value;
			else sFG_URL = Img.src;
		}*/
	}
}
function openDataForm( sURL, iW, iH, bScroll) 
{
	openFormWindow( sURL, "DataForm", iW, iH, bScroll);
}
function getRequestURL( sName)
{
//	alert( sName);
	return (sName.indexOf( "http://")==0 || sName.indexOf( "?")>=0)? sName: getURL() + "?REQUEST=" + sName;
}
function openDataForm2( sName, iW, iH) 
{
	openFormWindow( getRequestURL( sName), "DataForm", iW, iH);
}
function openReport( sName)
{
	openFormWindow( getRequestURL( sName), "DataReport", 1000, 700, true);
}
function setDataForm( Win) 
{
//	alert( "setDataForm");
	if( Win == null && parent.DataFrame ) Win = parent.DataFrame;
	form_win = Win;
	if( isReady( form_win) ) form_win.focus();
}
function getCursor()
{
	var Map = getObject( "MapFGFrame");
	if( Map ) return Map.style.cursor;
	return document.body.style.cursor;
}
function setCursor( sCursorName)
{
	var Map = getObject( "MapFGFrame");
//	if( !isIE() && getObject( "canvas") ) Map = getObject( "canvas");
	if( sCursorName && sCursorName.length > 0 ){
		if( sCursorName.indexOf( "url") >= 0 && sCursorName.indexOf( ",") < 0){
	 		if( Map ){
 		 		Map.style.cursor = isIE()? sCursorName: sCursorName + ", auto";
 			}else{
 				document.body.style.cursor = isIE()? sCursorName: sCursorName + ", auto";
 			}
 		}else{
	 		if( Map ){
 		 		Map.style.cursor = sCursorName;
 			}else{
 				document.body.style.cursor = sCursorName;
 			}
 		}
 	}else{
		if( Map ) Map.style.cursor = "auto";
		else document.body.style.cursor = "auto"; 
	}
}
function setComment( sNewComment)
{
	sComment = sNewComment;
}
function isPopUp()
{
	return bPopUp;
}
function setPopUp( bNewPopUp)
{
	bPopUp = bNewPopUp;
}
function getState()
{
	var aBWin = getObject( 'ButtonsFrame');
	if( aBWin ){
		aBWin = aBWin.contentWindow;
		if( aBWin.getState ) return aBWin.getState();
	}
	if( parent.ButtonsFrame && parent.ButtonsFrame.getState ) return parent.ButtonsFrame.getState();
	return 0;	
}
function isZoomClick() // In or Out
{
	var iZoom = getState() % 10;
//alert( getObject( 'ButtonsFrame') + );
	return iZoom == 1 || iZoom == 4;
}
