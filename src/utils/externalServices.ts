const gaNewElem: any = {};
const gaElems: any = {};

function addScriptLoadListener(scriptElement: HTMLScriptElement): Promise<void> {
  const listener = new Promise<void>((resolve) => {
    const callback = () => {
      scriptElement.removeEventListener('load', callback);
      resolve();
    };
    scriptElement.addEventListener('load', callback);
  });

  const timeout = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject("Failed to load Script.");
      }, 5000);
    }
  );

  return Promise.race([listener, timeout]);

}

export function loadGA() {
  // https://developers.google.com/analytics/devguides/collection/analyticsjs/
    const currdate: any = new Date();
  return addScriptLoadListener((function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*currdate;a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m); return a;
  })(window as any,document,'script','//www.google-analytics.com/analytics.js','ga', gaNewElem, gaElems));
  }

export function loadTagManager(id: string) {
    return addScriptLoadListener((function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j:any=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);return j;
  })(window as any,document,'script','dataLayer',id));
  }

export function loadPixel() {
  // https://developers.google.com/analytics/devguides/collection/analyticsjs/
    return addScriptLoadListener(
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ?
        n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s)
    return t;
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js'));
  }

export function loadGTag(id: string) {
    return addScriptLoadListener((function(w,d,s,l,i){w[l]=w[l]||[];w[l].push(['js', new Date()]);w[l].push(['config', id] );
  var f=d.getElementsByTagName(s)[0],j:any=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
  j.async=true;j.src='https://www.googletagmanager.com/gtag/js?id='+i+dl;f.parentNode.insertBefore(j,f);return j;
  })(window as any,document,'script','dataLayer',id));
  }

export function loadKakao(){

   return addScriptLoadListener((function (w, d, s) {
    var f = d.getElementsByTagName(s)[0], j: any = d.createElement(s)
    j.async = true;
    j.src = 'https://t1.daumcdn.net/adfit/static/kp.js';
    f.parentNode.insertBefore(j, f);
    return j
  })(window as any, document, 'script'));
  }

export function loadTwitterUniversal() {
    return addScriptLoadListener((function (e, t, n, s?: any, u?: any, a?: any,) {
    e.twq || (s = e.twq = function () {
      s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments);
    }, s.version = '1.1', s.queue = [], u = t.createElement(n), u.async = !0, u.src = 'https://static.ads-twitter.com/uwt.js',
      a = t.getElementsByTagName(n)[0], a.parentNode.insertBefore(u, a));
    return u;
  })(window as any, document, 'script'));
}

export function loadTwitterTag() {
    return addScriptLoadListener((function (w, d, s) {
    var f = d.getElementsByTagName(s)[0], j: any = d.createElement(s)
    j.async = true;
    j.src = 'https://platform.twitter.com/oct.js';
    f.parentNode.insertBefore(j, f);
    return j
  })(window as any, document, 'script'));
}
