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
   * Check status of Fetch requests.
   */
  static checkStatus(response) {
    if (response.status === 200) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(new Error(`Request has failed. Return status: ${response.statusText}`))
    }
  }

  /**
   * Convert response to JSON data
   */
  static json(response) {
    return response.json()
  }

  /**
   * Opens the IndexedDB
   */
  static openDB() {
    const dbPromise = idb.open('restaurantsDB', 1, upgradeDb => {
      const store = upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
      store.createIndex('by-id', 'id');
    });
    return dbPromise;
  }

  /**
   * Get the Restaurants from the IDB
   */
  static getRestaurantsFromDB() {
    const restaurantsFromDB = DBHelper.openDB()
    .then( db => {
      console.log('Getting Restaurants From DB');
      if(!db) return;
      let store = db.transaction('restaurants').objectStore('restaurants');
      return store.getAll();
    });
    return restaurantsFromDB;
  }

  /**
   * Get the Restaurants from the Server API
   */
  static getRestaurantsFromAPI(){
    console.log('Getting Restaurants From API');
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
   * Save restaurant data to IDB
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

    //return (`/img/${restaurant.photograph}`);
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
  //  static mapMarkerForRestaurant(restaurant, map) {
  //   // https://leafletjs.com/reference-1.3.0.html#marker  
  //   const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
  //     {title: restaurant.name,
  //     alt: restaurant.name,
  //     url: DBHelper.urlForRestaurant(restaurant)
  //     })
  //     marker.addTo(newMap);
  //   return marker;
  // } 
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

}

