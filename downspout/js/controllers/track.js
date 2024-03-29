angular.module('downspout').controller('TrackController', ['$scope', function($scope) {
    var mixLength = 12; // minutes

    $scope.liked = false;
    $scope.follow = false;

    /* Deterimine if the track is liked / followed */
    var getLikeAndFollow = function() {
        // We shouldn't hit here, but just in case, let's catch it
        if (!$scope.feedItem.origin) {
            console.log('no track');
            return;
        }

        console.log('some track');
        SC.get("/me/favorites/" + $scope.feedItem.origin.id, function(data, error) {
            // console.log(data);

            if (error) {
                if (error.message.indexOf('404') === -1) {
                    console.error(error);
                }
            } else if (!data.errors) {
                $scope.$apply(function() {
                    $scope.liked = true;
                });
            }

        });
        // track.id
        // track.user_id
    }


    $scope.toggleLike = function() {
        if ($scope.liked) {
            SC.delete("/me/favorites/" + $scope.feedItem.origin.id, function(data, error) {
                if (error) {
                    console.error("Error unliking " + $scope.feedItem.origin.id + ":", error);
                    return;
                }
                $scope.$apply(function() {
                    $scope.liked = false;
                });

            });
        } else {
            SC.put("/me/favorites/" + $scope.feedItem.origin.id, function(data, error) {
                if (error) {
                    console.error("Error liking " + $scope.feedItem.origin.id + ":", error);
                    return;
                }
                $scope.$apply(function() {
                    $scope.liked = true;
                });
            });
        }
    }

    /*
     * Given an artwork URL, spits out the url for the full sized image
     */
    $scope.getLargerAlbumArt = function() {
        // We shouldn't hit here, but just in case, let's catch it
        if (!$scope.track) {
            return '';
        }

        var url = $scope.track.artwork_url || $scope.track.user.avatar_url;
        if (!url) {
            // TODO: Need better default image.
            return 'http://placehold.it/500x500';
        }
        return url.replace('large', 't500x500');
    };

    /*
     * Given a timestamp, spit out a human readable time
     * TODO: Get rid of time argument
     */
    $scope.timestamp = function(time) {
        return moment(new Date(time)).fromNow();
    }

    /*
     * What's the download URL of this track, if any?
     * TODO: Get rid of track argument
     */
    $scope.downloadUrl = function() {

        if (!$scope.track
            || (!$scope.filters.mixes && $scope.track.duration / 1000 / 60) > 12
        ) {
            return '';
        }

        var purchaseTitle = $scope.track.purchase_title,
            purchaseUrl = $scope.track.purchase_url;

        if ($scope.track.downloadable) {
            return $scope.track.permalink_url + "/download";
        }

        if (purchaseTitle && !!purchaseTitle.toLowerCase().trim().match("free|download")) {
            return purchaseUrl;
        }

        return "";
    }

    /*
     * Should we even show this track?
     */
    $scope.showTrack = function() {

        // Is it ready?
        if (!$scope.track) {
            return false;
        }

        // Is it even streamable?
        if (!$scope.track.streamable || $scope.track.sharing !== "public") {
            return false;
        }

        // Is it missing a download URL / isn't free?
        if ($scope.filters.downloadOnly && !$scope.downloadUrl()) {
            return false;
        }

        // Is it a mix?
        if (!$scope.filters.mixes && ($scope.track.duration / 1000 / 60) > mixLength) {
            return false;
        }


        return true;
    }


    getLikeAndFollow();

}]);
