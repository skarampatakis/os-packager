'use strict';

var _ = require('lodash');

var utils = require('../../../services/utils');
var cosmopolitan = require('../../../services/cosmopolitan');

angular.module('Application')
  .factory('UtilsService', [
    '$q',
    function($q) {
      var allContinents = null;
      var allCountries = null;
      var allCurrencies = null;
      var allCities = null;

      return {
        findConcept: function(osType) {
          return _.find(utils.availableConcepts, function(concept) {
            return concept.osType == osType;
          });
        },
        getAvailableConcepts: function() {
          return utils.availableConcepts;
        },
        prepareFiscalPeriod: function(period) {
          var range = [];
          var result = undefined;
          if (!!period) {
            range = _.filter([
              period.start || period.from,
              period.end || period.to
            ]);
          }
          switch (range.length) {
            case 1:
              result = {
                start: range[0]
              };
              break;
            case 2:
              result = {
                start: range[0],
                end: range[1]
              };
              break;
          }
          return result;
        },

        getCurrencies: function() {
          if (allCurrencies) {
            return allCurrencies;
          }
          var result = [];
          result.$promise = $q(function(resolve, reject) {
            cosmopolitan.getCurrencies(false)
              .then(resolve)
              .catch(reject);
          });
          result.$promise.then(function(items) {
            [].push.apply(result, items);
            return items;
          });
          allCurrencies = result;
          return result;
        },

        getDefaultCurrency: function() {
          return utils.getDefaultCurrency();
        },

        getContinents: function() {
          if (allContinents) {
            return allContinents;
          }
          var result = [];
          result.$promise = $q(function(resolve, reject) {
            cosmopolitan.getContinents(false)
              .then(resolve)
              .catch(reject);
          });
          result.$promise.then(function(items) {
            [].push.apply(result, items);
            return items;
          });
          allContinents = result;
          return result;
        },
        getCountries: function getCountries(continent) {
          if (!continent && allCountries) {
            // If continent is not available, use cache (all countries)
            return allCountries;
          }
          var result = [];
          result.$promise = $q(function(resolve, reject) {
            if (!!continent) {
              // If continent is available, try to load all countries,
              // and then filter them. Resolve with filtered array
              getCountries().$promise.then(function(countries) {
                var filtered = [];
                if (_.isArray(continent)) {
                  filtered = _.filter(countries, function(country) {
                    return !!_.find(continent, function(item) {
                      return item == country.continent;
                    });
                  });
                } else {
                  filtered = _.filter(countries, function(country) {
                    return country.continent == continent;
                  });
                }

                [].push.apply(result, filtered);
                resolve(result);
              }).catch(reject);
            } else {
              // If continent is not available, just load all countries
              cosmopolitan.getCountries(false)
                .then(resolve)
                .catch(reject);
            }
          });
          result.$promise.then(function(items) {
            [].push.apply(result, items);
            return items;
          });
          if (!continent) {
            // If continent is not available, cache all countries
            allCountries = result;
          }
          return result;
        },
        //TODO: Fix performance
        //just a copy of getCountries for demonstration. A better approach could
        // be to get the variables on country selection using a filter on 
        // the API. Countries are by far less than all cities. Maybe also
        //loading from local file could be a possible solution.
        getCities: function getCities(country) {
          if (!country && allCities) {
            // If country is not available, use cache (all countries)
            return allCities;
          }
          var result = [];
          result.$promise = $q(function(resolve, reject) {
            if (!!country) {
              // If continent is available, try to load all countries,
              // and then filter them. Resolve with filtered array
              getCities().$promise.then(function(cities) {
                var filtered = [];
                if (_.isArray(country)) {
                  filtered = _.filter(cities, function(city) {
                    return !!_.find(country, function(item) {
                      return item == city.country;
                    });
                  });
                } else {
                  filtered = _.filter(cities, function(city) {
                    return city.country == country;
                  });
                }

                [].push.apply(result, filtered);
                resolve(result);
              }).catch(reject);
            } else {
              // If country is not available, just load all countries
              cosmopolitan.getCities(false)
                .then(resolve)
                .catch(reject);
            }
          });
          result.$promise.then(function(items) {
            [].push.apply(result, items);
            return items;
          });
          if (!country) {
            // If continent is not available, cache all countries
            allCities = result;
          }
          return result;
        }
      };
    }
  ]);
