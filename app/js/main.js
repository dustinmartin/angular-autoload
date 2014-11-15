(function(){

    'use strict';

    function PersonFactory( $http, $q, $timeout ){

        function loadData(){

            var deferred = $q.defer();

            $http.get( "/person.json" ).then(function( response ){
                // Simulate a long request
                $timeout(function(){
                    deferred.resolve( response );
                }, 2000);
            });

            return deferred.promise;
            
        }

        return function( id, firstName, lastName ){
            
            var isLoading = false,
                data = { id: id, firstName: firstName || '', lastName: lastName || '' };
            
            Object.defineProperty( this, 'firstName', {
                get: function() { return data.firstName; },
                set: function( name ) { data.firstName = name; }
            });

            Object.defineProperty( this, 'lastName', {
                get: function() { return data.lastName; },
                set: function( name ) { data.lastName = name; }
            });

            Object.defineProperty( this, 'birthday', {
                get: function() {

                    if( !data.birthday ){
                        if( !isLoading ){

                            console.log( "Birthday not loaded. Retrieving from server." );

                            isLoading = true;

                            loadData().then(function( response ){
                                console.log( response.data.birthday );
                                isLoading = false;
                                data.birthday = response.data.birthday;
                            });
                        }
                    }

                    return data.birthday;
                },
                set: function( date ) { data.birthday = date; }
            });

        }

    }


    function MainController( Person ){
        
        var vm = this;

        vm.people = [
            { id: 1, firstName: "John", lastName: "Doe" },
            { id: 2, firstName: "Bob", lastName: "Smith" },
            { id: 3, firstName: "Paul", lastName: "Martin" },
        ];

        vm.people = vm.people.map(function( person ){
            return new Person( person.id, person.firstName, person.lastName );
        });

    }

    angular.module( 'dm:autoLoad', [] )
        .factory( 'Person', PersonFactory )
        .controller( 'MainController', MainController );

})();
