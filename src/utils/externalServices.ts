const gaNewElem: any = {};
const gaElems: any = {};

export function loadGA(): void {
  // https://developers.google.com/analytics/devguides/collection/analyticsjs/
  // tslint:disable
  const currdate: any = new Date();

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*currdate;a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window as any,document,'script','//www.google-analytics.com/analytics.js','ga', gaNewElem, gaElems);
  // tslint:enable
}

export function loadTagManager(id: string): void {
  // tslint:disable
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j:any=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window as any,document,'script','dataLayer',id);
  // tslint:enable
}

export function loadPixel() {
  // https://developers.google.com/analytics/devguides/collection/analyticsjs/
  // tslint:disable
  !function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ?
        n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s)
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  // tslint:enable
}
