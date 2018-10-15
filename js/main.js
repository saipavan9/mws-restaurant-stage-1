let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
  updateRestaurants();
});

/**
 * Initialize Google map, called from HTML.
 */
const mapToggle = () =>{

  let theMap = document.getElementById('map');
  let toggleMapButton = document.getElementById('togglemap');
  let buttonState = toggleMapButton.getAttribute('aria-pressed');
  let pressed = 'false';
  let labelText = 'Display Map';

  if(buttonState == 'true'){
    pressed = 'false';
    labelText = 'Display map';
    theMap.style.height = '0';
    theMap.innerHTML = "";
  }
  else{
    let loc = {
      lat: 40.722216,
      lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'),{
      zoom: 12,
      center: loc,
      scrollwheel: false
    });
    pressed = 'true';
    labelText = 'Hide map';
    theMap.style.height = '400px';
  }

  toggleMapButton.setAttribute('aria-pressed',pressed);
  toggleMapButton.setAttribute('aria-label',labelText);
  toggleMapButton.innerHTML = labelText;
  addMarkersToMap();
}

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Add image lazyloading using IntersectionObserver
 */
observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) return;
    var targets = entry.target.childNodes;
    for (const target of targets) {
      target.setAttribute('srcset',target.getAttribute('data-srcset'));
      if (target.tagName === 'IMG') {
        target.setAttribute('src',target.getAttribute('data-srcset'));
      }
    }
    observer.unobserve(entry.target);
  }
});

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const picture = document.createElement('picture');
  li.appendChild(picture);
  observer.observe(picture);

  const sourcewebp = document.createElement('source');
  sourcewebp.setAttribute('data-srcset',`/source/img/${restaurant.id}.webp`);
  sourcewebp.setAttribute('type', 'image/webp');
  picture.appendChild(sourcewebp);

  const sourcexsmall = document.createElement('source');
  sourcexsmall.setAttribute('media', '(min-width: 360px)');
  sourcexsmall.setAttribute('data-srcset',DBHelper.imageUrlForRestaurant(restaurant, 'xsmall'));
  sourcexsmall.setAttribute('type', 'image/jpeg');
  picture.appendChild(sourcexsmall);

  const sourcesmall = document.createElement('source');
  sourcesmall.setAttribute('media', '(min-width: 520px)');
  sourcesmall.setAttribute('data-srcset',DBHelper.imageUrlForRestaurant(restaurant, 'small'));
  sourcesmall.setAttribute('type', 'image/jpeg');
  picture.appendChild(sourcesmall);

  const sourcemedium = document.createElement('source');
  sourcemedium.setAttribute('media', '(min-width: 800px)');
  sourcemedium.setAttribute('data-srcset',DBHelper.imageUrlForRestaurant(restaurant, 'medium'));
  sourcemedium.setAttribute('type', 'image/jpeg');
  picture.appendChild(sourcemedium);

  const sourcelarge = document.createElement('source');
  sourcelarge.setAttribute('media', '(min-width: 1000px)');
  sourcelarge.setAttribute('data-srcset',DBHelper.imageUrlForRestaurant(restaurant, 'large'));
  sourcelarge.setAttribute('type', 'image/jpeg');
  picture.appendChild(sourcelarge);

  const sourcedesk = document.createElement('source');
  sourcedesk.setAttribute('media', '(min-width: 1500px)');
  sourcedesk.setAttribute('data-srcset',`/build/img/${restaurant.id}-original.jpg`);
  sourcedesk.setAttribute('type', 'image/jpeg');
  picture.appendChild(sourcedesk);

  const picimage = document.createElement('img');
  picimage.className = 'restaurant-img';
  picimage.setAttribute('data-srcset',`/build/img/${restaurant.id}-original.jpg`);
  picimage.alt = `Image of ${restaurant.name} restaurant.`;
  picture.appendChild(picimage);

  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  const moreTitle = `Read ${restaurant.name}'s restaurant details.`;
  more.innerHTML = 'View Details';
  more.tabIndex = '0';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', moreTitle);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}