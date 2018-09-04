const version = 2;
const staticCacheName = `restaurants-dynamic-v${version}`;
const urlsToCache = [
  './',
  'index.html',
  'restaurant.html',
  'manifest.json',
  'build/js/app.js',
  'build/js/dbhelper.js',
  'build/js/main.js',
  'build/js/restaurant_info.js',
  'build/js/idb.js',
  'build/css/main.css',
  'assets/icons/favicon.ico',
  'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700',
  'build/img/1-original.jpg',
  'build/img/2-original.jpg',
  'build/img/3-original.jpg',
  'build/img/4-original.jpg',
  'build/img/5-original.jpg',
  'build/img/6-original.jpg',
  'build/img/7-original.jpg',
  'build/img/8-original.jpg',
  'build/img/9-original.jpg',
  'build/img/10-original.jpg',
  'build/img/1-small.jpg',
  'build/img/2-small.jpg',
  'build/img/3-small.jpg',
  'build/img/4-small.jpg',
  'build/img/5-small.jpg',
  'build/img/6-small.jpg',
  'build/img/7-small.jpg',
  'build/img/8-small.jpg',
  'build/img/9-small.jpg',
  'build/img/10-small.jpg',
  'build/img/1-medium.jpg',
  'build/img/2-medium.jpg',
  'build/img/3-medium.jpg',
  'build/img/4-medium.jpg',
  'build/img/5-medium.jpg',
  'build/img/6-medium.jpg',
  'build/img/7-medium.jpg',
  'build/img/8-medium.jpg',
  'build/img/9-medium.jpg',
  'build/img/10-medium.jpg',
  'build/img/1-large.jpg',
  'build/img/2-large.jpg',
  'build/img/3-large.jpg',
  'build/img/4-large.jpg',
  'build/img/5-large.jpg',
  'build/img/6-large.jpg',
  'build/img/7-large.jpg',
  'build/img/8-large.jpg',
  'build/img/9-large.jpg',
  'build/img/10-large.jpg'
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(staticCacheName)
      .then(cache => cache.addAll(urlsToCache))
      .then(self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(cacheNames.map(cache => {
      if (cache !== staticCacheName) {
        console.log("[ServiceWorker] removing cached files from ", cache);
        return caches.delete(cache);
      }
    })))
  )
})


self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  if(event.request.url.startsWith(self.location.origin))
  {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  }
});