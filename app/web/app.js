'use strict';

var angular = require('angular');
var ngRoute = require('angular-route');
var _ = require('underscore');
require('./views/videos_list.html');
require('./views/video_details.html');

angular.module('videosApp', ['ngRoute', 'videos_list.html', 'video_details.html'])
    .factory('videosSvc', [
            '$http', function ($http) {
                var httpreq = $http.get('/api/video');

                return {
                    videos: function () {
                        return httpreq
                            .then(function (data) {
                                return data.data;
                            });
                    }
                };
            }
    ])
    .controller('VideosController', [
            '$http', 'videosSvc', function ($http, videosSvc) {
                var vc = this;

                videosSvc.videos().then(function (data) {
                    vc.videos = data;
                });
            }
    ])
    .controller('DetailsController', [
            '$routeParams', 'videosSvc', function ($routeParams, videosSvc) {
                var dc = this;

                videosSvc.videos().then(function (data) {
                    dc.video = _.where(data, {_id: $routeParams.id})[0];
                });
            }
    ])
    .config([
            '$routeProvider',
            function ($routeProvider) {
                $routeProvider
                    .when('/', {
                        controller: 'VideosController as vc',
                        templateUrl: 'videos_list.html'
                    })
                    .when('/video/:id', {
                        controller: 'DetailsController as dc',
                        templateUrl: 'video_details.html',
                    })
                    .otherwise({
                        redirectTo: '/'
                    });
            }
    ]);
