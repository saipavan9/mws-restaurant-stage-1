const appCacheName = "restaurant-cache-v5";
const urlsToCache = [
  './',
  'index.html',
  'restaurant.html',
  'restaurant.html?id=1',
  'restaurant.html?id=2',
  'restaurant.html?id=3',
  'restaurant.html?id=4',
  'restaurant.html?id=5',
  'restaurant.html?id=6',
  'restaurant.html?id=7',
  'restaurant.html?id=8',
  'restaurant.html?id=9',
  'restaurant.html?id=10',
  'manifest.json',
  'build/js/app.js',
  'build/js/dbhelper.js',
  'build/js/main.js',
  'build/js/restaurant_info.js',
  'build/js/idb.js',
  'build/css/main.css',
  'assets/icons/favicon-16x16.png',
  'assets/icons/favicon-32x32.png',
  'assets/icons/favicon-96x96.png',
  'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700',
  'source/img/1.webp',
  'source/img/2.webp',
  'source/img/3.webp',
  'source/img/4.webp',
  'source/img/5.webp',
  'source/img/6.webp',
  'source/img/7.webp',
  'source/img/8.webp',
  'source/img/9.webp',
  'source/img/10.webp',
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
  'build/img/1-xsmall.jpg',
  'build/img/2-xsmall.jpg',
  'build/img/3-xsmall.jpg',
  'build/img/4-xsmall.jpg',
  'build/img/5-xsmall.jpg',
  'build/img/6-xsmall.jpg',
  'build/img/7-xsmall.jpg',
  'build/img/8-xsmall.jpg',
  'build/img/9-xsmall.jpg',
  'build/img/10-xsmall.jpg',
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

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(appCacheName).then(function(cache) {
      console.log('Service Worker installed');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  //console.log('Activating new service worker...');
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (appCacheName.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(event) {
  //console.log('Handling fetch event for', event.request.url);

  if (event.request.method === 'GET') {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        //console.log('Found response in cache:', response);
        return response;
      }
      //console.log('No response found in cache. About to fetch from network...');

      return fetch(event.request).then(function(response) {
        //console.log('Response from network is:', response);
        return response;
      }).catch(function(error) {
        //console.error('Fetching failed:', error);
        throw error;
      });
    }).catch(function () {
      return new Response('No cache found');
    })
  );
  }

});