'use strict';

require('jquery-browserify');
require('bootstrap');
require('./app.css');
var angular = require('angular');
var ngRoute = require('angular-route');
require('angular-bootstrap');
var _ = require('underscore');
require('./views/videos_list.html');
require('./views/video_details.html');

angular.module('videosApp', ['ngRoute', 'ui.bootstrap', 'videos_list.html', 'video_details.html'])
    .factory('socket', [
            '$rootScope', function ($rootScope) {
                var socket = io.connect();
                return {
                    on: function (eventName, callback) {
                        function wrapper() {
                            var args = arguments;
                            $rootScope.$apply(function () {
                                callback.apply(socket, args);
                            });
                        }

                        socket.on(eventName, wrapper);
                        return function () {
                            socket.removeListener(eventName, wrapper);
                        };
                    }
                };
            }
    ])
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
    .factory('showsSvc', [
        '$http', function ($http) {
            var httpreq = $http.get('/api/shows');

            return {
                shows: function () {
                    return httpreq
                        .then(function (data) {
                            return data.data;
                        });
                }
            };
        }
    ])
    .controller('VideosController', [
            '$http', 'socket', 'videosSvc', 'showsSvc', function ($http, socket, videosSvc, showsSvc) {
                var vc = this;

                videosSvc.videos().then(function (data) {
                    vc.videos = data;
                });

                vc.shows = [''];
                vc.showFilter = { "show": "" };
                showsSvc.shows().then(function (data) {
                    vc.shows = [''].concat(data);
                });

                socket.on('info', function (data) {
                    videosSvc.videos().then(function (videos) {
                        var video = _.where(videos, {video_id: data.worker})[0];
                        if (video) {
                            video.showProgress = true;
                            video.progress = data.progress;
                        }
                    });
                });

                vc.addUrl = function () {
                    var data = {
                        url: vc.search,
                        show: vc.showFilter.show
                    };
                    $http.post('/api/show', data)
                        .then(function (response) {
                            vc.videos.unshift(response.data);
                            vc.search = '';
                        });
                };
            }
    ])
    .controller('DetailsController', [
            '$routeParams', 'videosSvc', function ($routeParams, videosSvc) {
                var dc = this;

                videosSvc.videos().then(function (data) {
                    dc.video = _.where(data, {video_id: $routeParams.id})[0];
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
