function PopupController ($scope, $rootScope, $log, $modal, restService, $filter,
                          $modalInstance, popupData, sortingManager, bookService, storingDataManager, $timeout) {
    $scope.dataFlight = popupData.dataFlight;
    $scope.searchedClass = storingDataManager.getData('class');
    $scope.currentAirline = popupData.currentAirline;
    $scope.popupName = popupData.popupName;
    $scope.currentFlightDirection = popupData.currentFlightDirection;
    $scope.activeOrderForDirections = 'price';
    $scope.priceObj = popupData.priceObj;
    $scope.currentFlights = popupData.currentFlights;
    $scope.returnDirection = popupData.returnDirection;
    $scope.currentLang = storingDataManager.currentLang;
    $scope.ticketsObj = sortingManager.getSortedTickets();
    $scope.popupName == 'bookPopup' ? initBookPopup() : "";

    $scope.close = function () {
        switch($scope.popupName) {
            case 'bookPopup' :
                bookService.removePassengerData();
                $rootScope.bookRules = null;
        }
        $modalInstance.close();
    };

    /**
     * @function scope.orderDirections - function for ordering directions obj
     *
     * @param orderBy - could be "price", "time", "start_time" - order property
     * @param airlineObj - airline object with directions to order by
     */
    $scope.orderDirections = function(orderBy, airlineObj) {
        switch(orderBy) {
            case "price":
                sortingManager.sortDirections(orderBy, airlineObj);
                $scope.activeOrderForDirections = orderBy;
                break;
            case "time" :
                sortingManager.sortDirections(orderBy, airlineObj);
                $scope.activeOrderForDirections = orderBy;
                break;
            case "start_time":
                sortingManager.sortDirections(orderBy, airlineObj);
                $scope.activeOrderForDirections = orderBy;
                break;
            default:
                $log.error('Bad orderBy property')
        }
        $scope.airlineOptions = sortingManager.getPreparedDirectionsObj();
    }

    $scope.popupName == 'ticketOptions' ? $scope.orderDirections('price', $scope.currentAirline) :"";

    /**
     * @function scope.setActiveDirection - setter properties for activate required direction
     * @param directionId - arrive or depart flight direction id
     * @param directionsObjIndex - if 1 - arrive journey, if 0 - depart journey
     */
    $scope.setActiveDirection = function(directionId, directionsObjIndex) {
        sortingManager.addActivePropertiesToDirection(directionId, directionsObjIndex);
    }

    /**
     * @function $scope.addPassengerForm - wrapper for adding new passenger data panel
     */
    $scope.addPassengerForm = function() {
        bookService.pushPassenger();
    }

    /**
     * @function $scope.removePassengerForm - wrapper for removing passenger data panel
     * @param formObj - object of book form
     */
    $scope.removePassengerForm = function(formObj) {
        if (bookService.popPassenger(formObj)) {
            $scope.countTotalPrice(formObj);
        }
    }

    /**
     * @function $scope.sendBookData - for sending passengers data if form is valid
     * @param isValidForm - true if book form is valid and false if not
     * @param phone - phone parameter
     * @param email - email parameter
     */
    $scope.sendBookData = function(isValidForm, phone, email) {
        if (isValidForm == true) {
            $scope.submitted = false;
            var bookObj = {
                action: 'book',
                email: email,
                phone: phone.slice(1),
                activity_id: $scope.ticketsObj.activity_id,
                solution_id: $scope.currentAirline.active_solution.id,
                'fname[]': $.map($scope.passengerData, function(passengerObj) {
                            return  passengerObj.fname;
                        }),
                'lname[]': $.map($scope.passengerData, function(passengerObj) {
                        return passengerObj.lname;
                    }),
                'birth_date[]': $.map($scope.passengerData, function(passengerObj) {
                    return $filter('date')(new Date(passengerObj.birth_date), "yyyy-MM-dd");
                }),
                'gender[]': $.map($scope.passengerData, function(passengerObj) { return 'male' })
            };

            restService.sendBookData(bookObj).then(function(bookObj) {
                (angular.isDefined(bookObj.error)
                    && (bookObj.error != null)
                    && angular.isDefined(bookObj.error.error))
                        ? $scope.openBookErrorsPopup(bookObj.error.code + ' ' + bookObj.error.error.code)
                        : $scope.openBookErrorsPopup('Booking is successful!')
                restService.getBookData($scope.ticketsObj.activity_id).then(function(bookData) {
                    $rootScope.bookRules = angular.isDefined(bookData.tickets)
                                            && angular.isDefined(bookData.tickets[0])
                                            && angular.isDefined(bookData.tickets[0].fare_rules)
                        ? bookData.tickets[0].fare_rules : null;
                });
            })
        } else {
            $scope.submitted = true;
        }
    }

    $scope.openBook = function(airline, flight, rFlight) {
        $scope.close();
        $rootScope.openBookPopup(airline, flight, rFlight);
    }

    $scope.openBookRulesPopup = function() {
        if($rootScope.bookRules != null) {
            $rootScope.openPopup({
                templateUrl: '/public/views/book_rules_popup.html',
                size: 'sm'
            });
        }
    }

    $scope.openBookErrorsPopup = function(error) {
        $rootScope.bookError = error;
        $rootScope.openPopup({
            templateUrl: '/public/views/book_errors_popup.html',
            size: 'sm'
        });
    }

    /**
     * @function $scope.hideErrors - hides error fields in book popup
     */
    $scope.hideErrors = function() {
        $scope.submitted = false;
    }

    /**
     * function initBookPopup - initializer when opens book popup
     */
    function initBookPopup() {
        $rootScope.bookRules = null;
        $scope.submitted = false;
        $scope.totalPrice = bookService.getTotalPrice();
        $scope.passengerData = bookService.getPassengerData();
    }

    /**
     * @function $scope.countTotalPrice - get total price
     *
     * @param formObj - book form object with valid and invalid form fields
     */
    $scope.countTotalPrice = function(formObj) {
        $scope.tempFormObj = formObj;
        $scope.totalPrice = bookService.getTotalPrice(formObj);
    }

    $rootScope.$on('calendarBirthDate', function(e, date) {
        if (date) {
            var key = Object.keys(date)[0];
            var value = date[key];
            $rootScope.bookBirthDate.splice(+key, 1, value);
            $scope.totalPrice = bookService.getTotalPrice($scope.tempFormObj);
        }
    });

    /**
     * @function  $scope.isLastActive - check if current direction is last
     * @param key - if 1 arrive flight, 0 - depart
     * @param directionId - current direction id with last flight
     * @param directions - directions obj
     * @returns {boolean} - return true if last in list or false if not last element
     */
    $scope.isLastActive = function(key, directionId, directions) {
        if (key == 1) {
            var lastActiveDirectionId = 0;
            $.map(directions, function(direction, key) {
                if (direction.border == true) {
                    lastActiveDirectionId = direction.direction_id;
                }
            });
            return lastActiveDirectionId == directionId;
        }
    }
}

