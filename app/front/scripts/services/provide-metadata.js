'use strict';

var _ = require('lodash');

angular.module('Application')
  .factory('ProvideMetadataService', [
    '$timeout', 'PackageService', 'UtilsService',
    'ValidationService',
    function($timeout, PackageService, UtilsService,
      ValidationService) {
      var result = {};

      var geoData = {};

      var state = {};

      result.resetState = function() {
        state = {};
      };

      result.getState = function() {
        return state;
      };

      result.getGeoData = function() {
        return geoData;
      };

      result.updateFiscalPeriod = function(period) {
        if (period) {
          var attributes = PackageService.getAttributes();
          attributes.fiscalPeriod = UtilsService.prepareFiscalPeriod(period);
        }
      };

      var prependEmptyItem = function(items) {
        return _.union([{
          code: '',
          name: ''
        }], items);
      };

      geoData.regions = prependEmptyItem([]);
      geoData.countries = prependEmptyItem([]);

      UtilsService.getContinents().$promise
        .then(prependEmptyItem)
        .then(function(items) {
          geoData.regions = items;
        });

      // Preload countries, but do not show them until continent selected
      UtilsService.getCountries();
      geoData.countries = prependEmptyItem([]);

      result.updateCountries = function() {
        var attributes = PackageService.getAttributes();
        var regions = attributes.regionCode;
        regions = !!regions ? [regions]
          : _.map(
          geoData.regions,
          function(item) {
            return item.code;
          }
        );
        UtilsService.getCountries(regions).$promise.then(function(items) {
          var attributes = PackageService.getAttributes();
          geoData.countries = prependEmptyItem(items);
          var codes = _.map(items, function(item) {
            return item.code;
          });
          var isItemFound = !!_.find(codes, function(item) {
            return item == attributes.countryCode;
          });
          if (!isItemFound) {
            attributes.countryCode = '';
          }
        });
      };
      
      //UtilsService.getCities();
      geoData.cities = prependEmptyItem([]);

      result.updateCities = function() {
        var attributes = PackageService.getAttributes();
        var countries = attributes.countryCode.toLowerCase();
        countries = !!countries ? [countries]
          : _.map(
          geoData.countries,
          function(item) {
            return item.code;
          }
        );
       
        UtilsService.getCities(countries).$promise.then(function(items) {
          var attributes = PackageService.getAttributes();
          geoData.cities = prependEmptyItem(items);
          var codes = _.map(items, function(item) {
            return item.code;            
          });
          var isItemFound = !!_.find(codes, function(item) {
            return item == attributes.cityCode;
          });
          if (!isItemFound) {
            attributes.cityCode = '';
          }
        });
      };

      result.validatePackage = function(form) {
        var result = ValidationService.validateAttributesForm(form);
        if (result === true) {
          result = PackageService.validateFiscalDataPackage();
        }
        state.status = result;
        $timeout(function() {});
        return state;
      };

      return result;
    }
  ]);
