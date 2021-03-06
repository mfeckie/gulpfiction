(function (exports) {

    'use strict';

    exports.angular.module('npm.search.npmPackage', ['ngResource'])
        .factory('NpmPackage', function ($resource) {
            var query = 'keywords:gulpplugin,gulpfriendly';
            var fields = 'name,version,author,homepage,description,readme';

            var NPM_URL = 'http://registry.gulpjs.com/_search';
            var GITHUB_URL = 'https://api.github.com/repos/:owner/:repoName/readme';
            var NPM_URL_COUNT = 'http://registry.gulpjs.com/_count';

            var NpmPackage = $resource(NPM_URL, {
            }, {
                search: {
                    url: NPM_URL,
                    method: 'GET',
                    isArray: false
                },
                fetchReadmeFromGithub: {
                    url: GITHUB_URL,
                    method: 'GET',
                    isArray: false
                },
                count: {
                    url: NPM_URL_COUNT,
                    method: 'GET',
                    isArray: false
                }
            });

            NpmPackage.getSearchParams = function () {
                return {
                    q: query,
                    fields: fields
                };
            };

            NpmPackage.getMaxPageSizeParams = function () {
                return {
                    q: query
                };
            };

            return NpmPackage;
        });

})(this);
