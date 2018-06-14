// Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
// Facebook Pixel
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0; t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','//connect.facebook.net/en_US/fbevents.js');

function getDeviceType() {
  if ('' === '1') {
    return 'tablet';
  } else if ('' === '1') {
    return 'mobile';
  } else {
    return 'pc';
  }
}

function trackBeacon (event, params) {
  if (params === undefined) {
    var params = {};
  }
  params.event = event;
  params.user_id = ('ohwhos' == '') ? 'unknown' : 'ohwhos';
  params.ruid = getRUID();

  var src = makeBeaconSrc(params);
  $.ajax({url: src, cache: false});
}

function makeBeaconSrc (params) {
  var beacon_img_src = 'https://s3.ap-northeast-2.amazonaws.com/beacon-papershop/beacon_papershop.gif';

  var queries = [];
  for (var key in params) {
    var value = params[key];
    if (typeof (value) === 'object') {
      value = JSON.stringify(value);
    }
    queries.push(key + '=' + value);
  }

  query_str = queries.join('&');
  return beacon_img_src + '?' + query_str;
}

function getPageMeta () {
  var originUrl = window.location.href;
  var splitUrl = originUrl.split('?');
  var queryString = splitUrl.length > 1 ? splitUrl[1] : '';
  var pathname = window.location.pathname;
  var page = pathname.split('/')[1];
  var path = (queryString === '') ? pathname : pathname + '?' + queryString;
  var deviceType = getDeviceType();

  var queryParams = {};

  if (queryString !== '') {
    queryString.split('&').forEach(function lambda(v) {
      queryParams[v.split('=')[0]] = v.split('=')[1];
    });
  }

  return {
    'page': page,
    'device': deviceType,
    'query_params': queryParams,
    'path': encodeURIComponent(path),
    'href': encodeURIComponent(originUrl),
    'referrer': encodeURIComponent(document.referrer)
  }
}

function setAndGetNewRUID () {
  var ruid = generateRUID();
  var expire_dt = new Date();
  expire_dt.setFullYear(expire_dt.getFullYear() + 2);
  expire_dt.toUTCString();
  document.cookie = 'RidiUID=' + ruid + ';expires=' + expire_dt + ';rawPath=\'/\';domain=.ridibooks.com;';

  return ruid;
}

function generateRUID () { // Public Domain/MIT
  var d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); // use high-precision timer if available
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function lambda(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function getRUID () {
  var ruid = document.cookie.replace(/(?:(?:^|.*;\s*)RidiUID\s*\=\s*([^;]*).*$)|^.*$/, '$1');
  if (typeof ruid === 'undefined' || ruid === '') {
    return setAndGetNewRUID();
  } else {
    return ruid;
  }
}

// initailize
ga('create', 'UA-10567409-11', 'auto');
fbq('init', '196740847397469');

// tracking pageView
ga('send','pageview');
fbq('track', 'PageView');
trackBeacon('pageView', getPageMeta());
