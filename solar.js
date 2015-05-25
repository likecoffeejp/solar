// Added for googlemaps 
var elevation, map ;

function initMap(f) {
 var myOpt = {
  zoom: 4,
  center: new google.maps.LatLng(34.288867765661344,135.3367392718792),
  mapTypeId: google.maps.MapTypeId.ROADMAP
 } ;
 f.map = new google.maps.Map(document.getElementById("map"), myOpt) ;
 google.maps.event.addListener(map, 'click', function(mouseEvent) { getPoint(mouseEvent.latLng) ; }) ;
 elevation = new google.maps.ElevationService() ;
}

function getPoint(latlng) {
 var locations = [latlng];
 elevation.getElevationForLocations({ locations: locations }, function(results, status) {
  if (status == google.maps.ElevationStatus.OK) {
   if (results[0].elevation) {
    var hpos = results[0].elevation ;
    document.para.lat.value = latlng.lat() ;
    document.para.lon.value = latlng.lng() ;
    if(hpos < 0) hpos = 0 ;
    document.para.alt.value = hpos ;
    document.para.def.value = Math.round(latlng.lng()/15) ;
   }
  }
 });
}

 // sin function using degree
 function sind(d) {
   return Math.sin(d*Math.PI/180) ; }
 // cos function using degree
 function cosd(d) {
   return Math.cos(d*Math.PI/180) ; }
 // tan function using degree
 function tand(d) {
   return Math.tan(d*Math.PI/180) ; }
 // calculate Julius year (year from 2000/1/1, for variable "t")
 function jy(yy,mm,dd,h,m,s,i) { // yy/mm/dd h:m:s, i: time difference
   yy -= 2000 ;
   if(mm <= 2) {
    mm += 12 ;
    yy-- ; }
   k = 365 * yy + 30 * mm + dd - 33.5 - i / 24 + Math.floor(3 * (mm + 1) / 5) 
     + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400);
   k += ((s / 60 + m) / 60 + h) / 24 ; // plus time
   k += (65 + yy) / 86400 ; // plus delta T
   return k / 365.25 ;
   }
 // solar position1 (celestial longitude, degree)
 function spls(t) { // t: Julius year
   l = 280.4603 + 360.00769 * t 
     + (1.9146 - 0.00005 * t) * sind(357.538 + 359.991 * t)
     + 0.0200 * sind(355.05 +  719.981 * t)
     + 0.0048 * sind(234.95 +   19.341 * t)
     + 0.0020 * sind(247.1  +  329.640 * t)
     + 0.0018 * sind(297.8  + 4452.67  * t)
     + 0.0018 * sind(251.3  +    0.20  * t)
     + 0.0015 * sind(343.2  +  450.37  * t)
     + 0.0013 * sind( 81.4  +  225.18  * t)
     + 0.0008 * sind(132.5  +  659.29  * t)
     + 0.0007 * sind(153.3  +   90.38  * t)
     + 0.0007 * sind(206.8  +   30.35  * t)
     + 0.0006 * sind( 29.8  +  337.18  * t)
     + 0.0005 * sind(207.4  +    1.50  * t)
     + 0.0005 * sind(291.2  +   22.81  * t)
     + 0.0004 * sind(234.9  +  315.56  * t)
     + 0.0004 * sind(157.3  +  299.30  * t)
     + 0.0004 * sind( 21.1  +  720.02  * t)
     + 0.0003 * sind(352.5  + 1079.97  * t)
     + 0.0003 * sind(329.7  +   44.43  * t) ;
  while(l >= 360) { l -= 360 ; }
  while(l < 0) { l += 360 ; }
  return l ;
  }
 // solar position2 (distance, AU)
 function spds(t) { // t: Julius year
   r = (0.007256 - 0.0000002 * t) * sind(267.54 + 359.991 * t)
     + 0.000091 * sind(265.1 +  719.98 * t)
     + 0.000030 * sind( 90.0)
     + 0.000013 * sind( 27.8 + 4452.67 * t)
     + 0.000007 * sind(254   +  450.4  * t)
     + 0.000007 * sind(156   +  329.6  * t)
   r = Math.pow(10,r) ;
   return r ;
   }
 // solar position3 (declination, degree)
 function spal(t) { // t: Julius year
   ls = spls(t) ;
   ep = 23.439291 - 0.000130042 * t ;
   al = Math.atan(tand(ls) * cosd(ep)) * 180 / Math.PI ;
   if((ls >= 0)&&(ls < 180)) {
     while(al < 0) { al += 180 ; }
     while(al >= 180) { al -= 180 ; } }
   else {
     while(al < 180) { al += 180 ; }
     while(al >= 360) { al -= 180 ; } }
   return al ;
   }
 // solar position4 (the right ascension, degree)
 function spdl(t) { // t: Julius year
   ls = spls(t) ;
   ep = 23.439291 - 0.000130042 * t ;
   dl = Math.asin(sind(ls) * sind(ep)) * 180 / Math.PI ;
   return dl ;
   }
 // Calculate sidereal hour (degree)
 function sh(t,h,m,s,l,i) { // t: julius year, h: hour, m: minute, s: second,
                            // l: longitude, i: time difference
   d = ((s / 60 + m) / 60 + h) / 24 ; // elapsed hour (from 0:00 a.m.)
   th = 100.4606 + 360.007700536 * t + 0.00000003879 * t * t - 15 * i ;
   th += l + 360 * d ;
   while(th >= 360) { th -= 360 ; }
   while(th < 0) { th += 360 ; }
   return th ;
   }
 // Calculating the seeming horizon altitude "sa"(degree)
 function eandp(alt,ds) { // subfunction for altitude and parallax
   e = 0.035333333 * Math.sqrt(alt) ;
   p = 0.002442818 / ds ;
   return p - e ;
   }
 function sa(alt,ds) { // alt: altitude (m), ds: solar distance (AU)
   s = 0.266994444 / ds ;
   r = 0.585555555 ;
   k = eandp(alt,ds) - s - r ;
   return k ;
   }
 // Calculating solar alititude (degree) {
 function soal(la,th,al,dl) { // la: latitude, th: sidereal hour,
                              // al: solar declination, dl: right ascension
   h = sind(dl) * sind(la) + cosd(dl) * cosd(la) * cosd(th - al) ;
   h = Math.asin(h) * 180 / Math.PI ;
   return h;
   }
 // Calculating solar direction (degree) {
 function sodr(la,th,al,dl) { // la: latitude, th: sidereal hour,
                              // al: solar declination, dl: right ascension
   t = th - al ;
   dc = - cosd(dl) * sind(t) ;
   dm = sind(dl) * sind(la) - cosd(dl) * cosd(la) * cosd(t) ;
   if(dm == 0) {
     st = sind(t) ;
     if(st > 0) dr = -90 ;
     if(st == 0) dr = 9999 ;
     if(st < 0) dr = 90 ;
     }
   else {
     dr = Math.atan(dc / dm) * 180 / Math.PI ;
     if(dm <0) dr += 180 ;
     }
   if(dr < 0) dr += 360 ;
   return dr ;
   }

function calc(f) { // main routine

 yy = parseInt(f.day.value.substr(0,4)) ;
 mm = parseInt(f.day.value.substr(5,2)) ;
 dd = parseInt(f.day.value.substr(8,2)) ;

 i = eval(f.def.value) ;
 la = eval(f.lat.value) ;//緯度
 lo = eval(f.lon.value) ;//経度
 alt = eval(f.alt.value) ;//標高
 ans = yy + "年" + mm + "月" + dd + "日の計算結果\n" ;

 t = jy(yy,mm,dd-1,23,59,0,i) ;
 th = sh(t,23,59,0,lo,i) ;
 ds = spds(t) ;
 ls = spls(t) ;
 alp = spal(t) ;
 dlt = spdl(t) ;
 pht = soal(la,th,alp,dlt) ;
 pdr = sodr(la,th,alp,dlt) ;

 for(hh=0; hh<24; hh++) {
  for(m=0; m<60; m++) {
   t = jy(yy,mm,dd,hh,m,0,i) ;
   th = sh(t,hh,m,0,lo,i) ;
   ds = spds(t) ;
   ls = spls(t) ;
   alp = spal(t) ;
   dlt = spdl(t) ;
   ht = soal(la,th,alp,dlt) ;
   dr = sodr(la,th,alp,dlt) ;
   tt = eandp(alt,ds) ;
   t1 = tt - 18 ;
   t2 = tt - 12 ;
   t3 = tt - 6 ;
   t5 = tt - 7.5 ;
   t4 = sa(alt,ds) ;
 // Solar check 
 // 0: non, 1: astronomical twilight start , 2: voyage twilight start,
 // 3: citizen twilight start, 4: sun rise, 5: meridian, 6: sun set,
 // 7: citizen twilight end, 8: voyage twilight end,
 // 9: astronomical twilight end

 // 天文薄明始まり
   if((pht<t1 )&&(ht>t1 ))
   {
	 document.getElementById("solar_mt1").innerText = strHHNN(hh,m);
	 document.getElementById("solar_md1").innerText = Math.floor(dr);
	 document.getElementById("solar_mh1").innerText = Math.floor(ht);
   }
   // 航海薄明始まり
   if((pht<t2 )&&(ht>t2 ))
   {
	 document.getElementById("solar_mt2").innerText = strHHNN(hh,m);
	 document.getElementById("solar_md2").innerText = Math.floor(dr);
	 document.getElementById("solar_mh2").innerText = Math.floor(ht);
   }
   // 夜明け	
   if((pht<t5 )&&(ht>t5 ))
   {
	 document.getElementById("solar_mt3").innerText = strHHNN(hh,m);
	 document.getElementById("solar_md3").innerText = Math.floor(dr);
	 document.getElementById("solar_mh3").innerText = Math.floor(ht);
   }
   // 市民薄明始まり	
   if((pht<t3 )&&(ht>t3 ))
   {
	 document.getElementById("solar_mt4").innerText = strHHNN(hh,m);
	 document.getElementById("solar_md4").innerText = Math.floor(dr);
	 document.getElementById("solar_mh4").innerText = Math.floor(ht);
   }
   // 日出	
   if((pht<t4 )&&(ht>t4 ))
   {
	 document.getElementById("solar_mt5").innerText = strHHNN(hh,m);
	 document.getElementById("solar_md5").innerText = Math.floor(dr);
	 document.getElementById("solar_mh5").innerText = Math.floor(ht);
   }
   // 南中	
   if((pdr<180)&&(dr>180))
   {
	 document.getElementById("solar_t").innerText = strHHNN(hh,m);
	 document.getElementById("solar_d").innerText = Math.floor(dr);
	 document.getElementById("solar_h").innerText = Math.floor(ht);
   }	
   // 日没	
   if((pht>t4 )&&(ht<t4 ))
   {
	 document.getElementById("solar_nt1").innerText = strHHNN(hh,m);
	 document.getElementById("solar_nd1").innerText = Math.floor(dr);
	 document.getElementById("solar_nh1").innerText = Math.floor(ht);
   }	
   // 市民薄明終わり	
   if((pht>t3 )&&(ht<t3 ))
   {
	 document.getElementById("solar_nt2").innerText = strHHNN(hh,m);
	 document.getElementById("solar_nd2").innerText = Math.floor(dr);
	 document.getElementById("solar_nh2").innerText = Math.floor(ht);
   }
   // 日暮れ	
   if((pht>t5 )&&(ht<t5 ))
   {
	 document.getElementById("solar_nt3").innerText = strHHNN(hh,m);
	 document.getElementById("solar_nd3").innerText = Math.floor(dr);
	 document.getElementById("solar_nh3").innerText = Math.floor(ht);
   }
   // 航海薄明終わり	
   if((pht>t2 )&&(ht<t2 ))
   {
	 document.getElementById("solar_nt4").innerText = strHHNN(hh,m);
	 document.getElementById("solar_nd4").innerText = Math.floor(dr);
	 document.getElementById("solar_nh4").innerText = Math.floor(ht);
   }
   // 天文薄明終わり	
   if((pht>t1 )&&(ht<t1 ))
   {
	 document.getElementById("solar_nt5").innerText = strHHNN(hh,m);
	 document.getElementById("solar_nd5").innerText = Math.floor(dr);
	 document.getElementById("solar_nh5").innerText = Math.floor(ht);
   }
   pht = ht ;
   pdr = dr ;
   }
  }
  document.getElementById("solar_caption").innerText = yy + "年" + mm + "月" + dd + "日";
  setProfile();
 }
 
function strHHNN(hh, m){
　　r = "";
  if (hh < 10)	r = "0";
  r += hh + ":";
  if (m  < 10)	r += "0";
  r += m;
 
  return r;
}
 
function conv(f) { // convert site data
 locst = f.location.value ;
 f.lat.value = locst.substring(0,9) ;
 f.lon.value = locst.substring(9,18) ;
 f.alt.value = locst.substring(19,25) ;
 f.def.value = locst.substring(26,28) ;
 }
function today(f) { // get doday
 Td = new Date() ;
 f.day.value = strdate2(Td);
 }
 
function today_calc(form)
{
	today(form);
	calc(form);
} 

function strdate2(d) {
  var date_format = "{0}-{1}-{2}".format(
    d.getFullYear(),
    d.getMonth()+1 < 10 ? "0" + (d.getMonth()+1) : (d.getMonth()+1),
    d.getDate()    < 10 ? "0" +  d.getDate()     :  d.getDate()
  );
  return date_format;
}

function urlEncode(instr){
	var outstr = encodeURI(instr);
	outstr = allReplace(outstr, '%EF%BD%9E','%e3%80%9C');  // # ～ 
	outstr = allReplace(outstr, '%E2%88%A5','%e2%80%96');  // ∥
	outstr = allReplace(outstr, '%EF%BC%8D','%e2%88%92');  // －
	outstr = allReplace(outstr, '%EF%BF%A0','%c2%a2');	   // ￠
	outstr = allReplace(outstr, '%EF%BF%A1','%c2%a3');     // ￡
	outstr = allReplace(outstr, '%EF%BF%A2','/%c2%ac');    // ￢
	return outstr;
}

function allReplace(text, s, t) {
	while (true) { 
		var text2 = text;
		text = text2.replace(s, t);
		if (text == text2) {
			break;  
		}
	}
	return text;
}

function getProfile()
{
	var para = document.getElementById("para");
	if (para)
	{
		try
		{
			var sy = getProfileCookie2("map_y") - 0;
			var sx = getProfileCookie2("map_x") - 0;
			var sz = getProfileCookie2("map_z") - 0;

			para.lat.value = sy.toFixed(5);
			para.lon.value = sx.toFixed(5);
			para.alt.value = sz.toFixed(2);
		}
		catch (e)
		{
		}
	}
}

function setProfile()
{
	var para = document.getElementById("para");
	if (para)
	{
		setProfileCookie("map_y", para.lat.value);
		setProfileCookie("map_x", para.lon.value);
		setProfileCookie("map_z", para.alt.value);
	}	
}


//-----------------------------------------
//  keyで指定されたクッキーを読み込む
//-----------------------------------------
function getCookie(key) {
    tmp = ' ' + document.cookie + ';';
    var xx1 = xx2 = 0;
    var len = tmp.length;
    while (xx1 < len) {
        xx2 = tmp.indexOf(';', xx1);
        var tmp2 = tmp.substring(xx1 + 1, xx2);
        xx3 = tmp2.indexOf('=');
        if (tmp2.substring(0, xx3) == key) {
            return(unescape(tmp2.substring(xx3 + 1, xx2 - xx1 - 1)));
        }
        xx1 = xx2 + 1;
    }
    return('');
}


//--------------------------------------------
//  プロフィールをクッキーから読み込む
//--------------------------------------------
function getProfileCookie2(cname){
	var profile = new Array();
	var cookie = getCookie('profile');
	if(cookie != ''){
		var ck = cookie.split(';');
		for(var j=0; j < ck.length; j++){
			var s = ck[j].split('=');
			if(s[0] == cname){
				return s[1];
			}	
		}
	}
	return null;
}


function getProfileCookie(){
	var profile = new Array();
	var cookie = getCookie('profile');

	if(cookie != ''){
		var ck = cookie.split(';');
		for(var j=0; j < ck.length; j++){
			profile.push(ck[j]);
		}
	}
	return profile;
}


function setProfileCookie(name, value){
	if(name != "" && value != "" ){
		var str = name + "=" + value;
		var profile = getProfileCookie();

		if(profile.length > 0){
			for(var i = 0 ; i < profile.length; i++) {
				var s = profile[i].split('=');
				if(s[0] != name){
					str += ";" + s[0] + "=" + s[1];
				}
			}
		}		
		setCookie('profile', str, '/');
	}
}

function setCookie(key, value, path) {
     var tmp = key + '=' + escape(value) + '; ';
     tmp += 'expires=Tue, 31-Dec-2030 23:59:59; ';
     tmp += 'path=' + path +'; ';
     document.cookie = tmp;
}

//
// String オブジェクトのメンバメソッドに直接追加
// -------------------------------------------------------

// String.format 存在チェック
if (String.prototype.format == undefined) {
    /**
     * フォーマット関数
     */
    String.prototype.format = function(arg)
    {
        // 置換ファンク
        var rep_fn = undefined;
        
        // オブジェクトの場合
        if (typeof arg == "object") {
            rep_fn = function(m, k) { return arg[k]; }
        }
        // 複数引数だった場合
        else {
            var args = arguments;
            rep_fn = function(m, k) { return args[ parseInt(k) ]; }
        }
        
        return this.replace( /\{(\w+)\}/g, rep_fn );
    }
}

// グローバル関数として定義
/**
 * フォーマット関数
 * --------------------------------------------------
 * 文字列フォーマット(添字引数版)
 * var str = "{0} : {1} + {2} = {3}".format("足し算", 8, 0.5, 8+0.5);
 */
var $format = function(fmt, a)
{
    var rep_fn = undefined;
    
    if (typeof a == "object") {
        rep_fn = function(m, k) { return a[ k ]; }
    }
    else {
        var args = arguments;
        rep_fn = function(m, k) { return args[ parseInt(k)+1 ]; }
    }
    
    return fmt.replace( /\{(\w+)\}/g, rep_fn);
}

/**
 * strftime
 * @param d
 * ---------------------------------------------------
 * strftime(new Date()))
 * "2012年01月02日:03時04分05秒"
 */
function strftime(d) {
  var date_format = "{0}年{1}月{2}日:{3}時{4}分{5}秒".format(
    d.getFullYear(),
    d.getMonth() < 10 ? "0" + d.getMonth() : d.getMonth(),
    d.getDate()  < 10 ? "0" + d.getDate() : d.getDate(),
    d.getHours() < 10 ? "0" + d.getHours() : d.getHours(),
    d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes(),
    d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds()
  );
  return date_format;
}
 
 
 
 
