class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Get Reviews Endpoint.
   */
  static get REVIEWS_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Check status of Fetch requests.
   */
  static checkStatus(response) {
    if (response.status === 200) {
      console.log(status);
      return Promise.resolve(response)
    } else {
      return Promise.reject(new Error(`Request has failed. Return status: ${response.statusText}`))
    }
  }

  /**
   * Convert response to JSON data.
   */
  static json(response) {
    return response.json()
  }

  /**
   * Opens the IndexedDB.
   */
  static openDB() {
    const dbPromise = idb.open('restaurantsDB', 1, upgradeDb => {
      switch (upgradeDb.oldVersion) {
        case 0:
          console.log('Creating IDB');
          const store = upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
          store.createIndex('by-id', 'id');
        case 1:
          console.log("Upgrading to DB v2");
          const reviews = upgradeDb.createObjectStore('reviews', {keyPath: 'id'});
          reviews.createIndex('restaurant','restaurant_id');
          const offlineReviews = upgradeDb.createObjectStore('offline_reviews', {keyPath: 'updatedAt'});
        case 2:
          console.log("Upgrading to DB v3");
          const offlineFavourites = upgradeDb.createObjectStore('offline_favourites', {keyPath: 'restaurant_id'});
          offlineFavourites.createIndex('by-restaurant', 'restaurant_id');
      }
    });
    return dbPromise;
  }

  /**
   * Get the Restaurants from the IDB.
   */
  static getRestaurantsFromDB() {
    const restaurantsFromDB = DBHelper.openDB()
    .then( db => {
      if(!db) return;
      let store = db.transaction('restaurants').objectStore('restaurants');
      return store.getAll();
    });
    return restaurantsFromDB;
  }

  /**
   * Get the Restaurants from the Server API.
   */
  static getRestaurantsFromAPI(){
    const restaurantsFromAPI = fetch(DBHelper.DATABASE_URL)
    .then(DBHelper.checkStatus)
    .then(DBHelper.json)
    .then(restaurants => {
      DBHelper.saveRestaurants(restaurants);
      return restaurants;
    });
    return restaurantsFromAPI;
  }

  /**
   * Save restaurants data to IDB.
   */
  static saveRestaurants(data){
    return DBHelper.openDB().then(db => {
      if(!db) return;
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');
      data.forEach((restaurant) => {
        store.put(restaurant);
      });
      return tx.complete;
    }).then(() => {
      console.log('Restaurants Saved')
    });
  }

  /**
   * Update restaurant data to IDB.
   */
  static updateRestaurant(data){
    return DBHelper.openDB().then(db => {
      if(!db) return;
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');
      return store.put(data);
    }).then(() => {
      console.log('Restaurant Updated')
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    return DBHelper.getRestaurantsFromDB().then(restaurants => {
      if(restaurants.length) {
        return Promise.resolve(restaurants);
      } else {
        return DBHelper.getRestaurantsFromAPI();
      }
    }).then(restaurants => {
      callback(null, restaurants);
    }).catch(error => {
      callback(error, null);
    })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
    DBHelper.fetchReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        //console.log('dbhelper fetchReviews !error()')
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant, imgWidth = null) {
    if (imgWidth !== null) {
      return `/build/img/${restaurant.id}-${imgWidth}.jpg`;
    }
    return `/build/img/${restaurant.id}-original.jpg`;
  }

  /**
   * Restaurant image SRCSET.
   */
  static imageSrcSetForRestaurant(restaurant) {
    const widthXsmall   = DBHelper.imageUrlForRestaurant(restaurant, 'xsmall');
    const widthSmall    = DBHelper.imageUrlForRestaurant(restaurant, 'small');
    const widthMedium   = DBHelper.imageUrlForRestaurant(restaurant, 'medium');
    const widthLarge    = DBHelper.imageUrlForRestaurant(restaurant, 'large');
    const widthOriginal = DBHelper.imageUrlForRestaurant(restaurant);
    const imageSrcSet = `${widthXsmall} 360w, ${widthSmall} 520w, ${widthMedium} 800w, ${widthLarge} 1000w, ${widthOriginal} 1500w`;
    return imageSrcSet;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  /**
   * Get the Reviews from the IDB.
   */
  static getReviewsFromDB() {
    const reviewsFromDB = DBHelper.openDB()
    .then( db => {
      if(!db) return;
      let store = db.transaction('reviews').objectStore('reviews').index('restaurant');
      return '';//store.getAll();
    });
    return reviewsFromDB;
  }

  /**
   * Get the Reviews from the Server API.
   */
  static getReviewsFromAPI(){
    const reviewsFromAPI = fetch(DBHelper.REVIEWS_URL)
    .then(DBHelper.checkStatus)
    .then(DBHelper.json)
    .then(reviews => {
      DBHelper.saveReviews(reviews);
      return reviews;
    });
    return reviewsFromAPI;
  }

  /**
   * Get the Reviews saved as Offline.
   */
  static checkOfflineReviews(){
    return new Promise((resolve,reject) => {
      DBHelper.openDB().then(db => {
        if(!db) return;
        let store = db.transaction('offline_reviews').objectStore('offline_reviews');
        store.getAll().then(data => {
          return resolve(data);
        }).catch(err => {
          reject(err);
        });
      })
    })
  }

  /**
   * Save Reviews data to IDB.
   */
  static saveReviews(data){
    return DBHelper.openDB().then(db => {
      if(!db) return;
      const tx = db.transaction('reviews', 'readwrite');
      const store = tx.objectStore('reviews');
      data.forEach((review) => {
        store.put(review);
      });
      return tx.complete;
    }).then(() => {
      console.log('Reviews saved')
    });
  }

  /**
   * Save Review data to IDB.
   */
  static saveReview(data){
    return DBHelper.openDB().then(db => {
      if(!db) return;
      const tx = db.transaction('reviews', 'readwrite');
      const store = tx.objectStore('reviews');
      store.put(data);
      return tx.complete;
    }).then(() => {
      console.log('Review saved')
      let event = new CustomEvent("update_reviews_list", {detail: {restaurant_id: data.restaurant_id}});
      document.dispatchEvent(event);
    });
  }

  /**
   * Save Review data to IDB's offline store.
   */
  static saveReviewOffline(data){
    return DBHelper.openDB().then(db => {
      if(!db) return;
      const tx = db.transaction('offline_reviews', 'readwrite');
      const store = tx.objectStore('offline_reviews');
      store.put(data);
      return tx.complete;
    }).then(() => {
      console.log('Review saved offline')
    });
  }

  /**
   * Submit the restaurant review to server.
   */
  static sendReview(data) {
    return fetch(DBHelper.REVIEWS_URL, {
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
    })
    .then(response => {
      response.json()
      .then(data => {
        data['restaurant_id'] = parseInt(getParameterByName('id'));
        data['updatedAt'] = new Date().getTime();
        data['createdAt'] = new Date().getTime();
        DBHelper.saveReview(data);
      })
    })
    .catch(error => {
      data['restaurant_id'] = parseInt(getParameterByName('id'));
      data['updatedAt'] = new Date().getTime();
      data['createdAt'] = new Date().getTime();
      DBHelper.saveReviewOffline(data);
    });
  }

  /**
   * Remove Offline Reviews and send them to server.
   */
  static removeOfflineReview(data) {
    return new Promise((resolve,reject) => {
      DBHelper.openDB().then(db => {
        if (!db) return;
        const tx = db.transaction('offline_reviews', 'readwrite');
        const requests = [];

        tx.objectStore('offline_reviews')
        .iterateCursor(cursor => {
          if (!cursor) return;
          DBHelper.sendReview(cursor.value)
          requests.push(cursor.value);
          cursor.delete();
          cursor.continue();
        }).then(() => {
          console.log('Item deleted');
        }).then(() => {
          return tx.complete;
        })
      })
    })
  }

  /**
   * Fetch all reviews.
   */
  static fetchReviews(callback) {
    return DBHelper.getReviewsFromDB().then(reviews => {
      if(reviews.length) {
        return Promise.resolve(reviews);
      } else {
        return DBHelper.getReviewsFromAPI();
      }
    }).then(reviews => {
      callback(null, reviews);
    }).catch(error => {
      callback(error, null);
    })
  }

  /**
   * Fetch reviews by its ID.
   */
  static fetchReviewByRestaurant(id, callback) {
    return DBHelper.openDB().then(db => {
      return db.transaction('reviews').objectStore('reviews').index('restaurant').getAll(id);
    }).then(obj => {
      return obj
    });
  }

  /**
   * Save Favourite data to IDB's offline store.
   */
  static saveFavouriteOffline(id, favourite_status){
    const data = []
    data['restaurant_id'] = parseInt(id);
    data['is_favorite'] = favourite_status;

    return DBHelper.openDB().then(db => {
      if(!db) return;
      const tx = db.transaction('offline_favourites', 'readwrite');
      const store = tx.objectStore('offline_favourites');
      store.put(data);
      return tx.complete;
    }).then(() => {
      console.log('Favourite saved offline')
    });
  }

  /**
   * Submit the restaurant review to server.
   */
  static sendFavourite(id, favourite_status) {
    let UPDATE_FAV_URL = `${DBHelper.DATABASE_URL}/${id}/?is_favorite=${favourite_status}`

    return fetch(UPDATE_FAV_URL, {
      method: 'PUT',
    })
    .then(response => {
      response.json()
      .then(data => {
        DBHelper.updateRestaurant(data);
      })
    })
    .catch(error => {
      DBHelper.saveFavouriteOffline(id, favourite_status);
    });
  }

  /**
   * Get the Favourites saved as Offline.
   */
  static checkOfflineFavourites(){
    return new Promise((resolve,reject) => {
      DBHelper.openDB().then(db => {
        if(!db) return;
        let store = db.transaction('offline_favourites').objectStore('offline_favourites');
        store.getAll().then(data => {
          return resolve(data);
        }).catch(err => {
          reject(err);
        });
      })
    })
  }

  /**
   * Remove Offline Favourites and send them to server.
   */
  static removeOfflineFavourite(data) {
    return new Promise((resolve,reject) => {
      DBHelper.openDB().then(db => {
        if (!db) return;
        const tx = db.transaction('offline_favourites', 'readwrite');
        const requests = [];

        tx.objectStore('offline_favourites')
        .iterateCursor(cursor => {
          if (!cursor) return;
          DBHelper.sendFavourite(cursor.value.restaurant_id, cursor.value.is_favorite)
          requests.push(cursor.value);
          cursor.delete();
          cursor.continue();
        }).then(() => {
          console.log('Favourite deleted');
        }).then(() => {
          return tx.complete;
        })
      })
    })
  }
}