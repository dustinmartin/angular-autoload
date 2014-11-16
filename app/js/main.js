(function(){

    'use strict';



    function PersonFactory( $http, $q, $timeout ){

        // This is overly simple. Would likely want to include the default
        // value as well as the type for every property.
        // var properties = [ 'id', 'firstName', 'lastName', 'birthday', 'email' ];

        // Something like this would be good
        var properties = {
            'id': {
                'default': '',
                'type': Number,
                'tags': [ 'default', 'extra' ]
            },
            'firstName': {
                'default': '',
                'type': String,
                'tags': [ 'default', 'extra' ]
            },
            'lastName': {
                'default': '',
                'type': String,
                'tags': [ 'default', 'extra' ]
            },
            'birthday': {
                'default': '',
                'type': Date,
                'tags': [ 'extra' ]
            },
            'email': {
                'default': '',
                'type': String,
                'tags': [ 'extra' ]
            }
        };

        // -- Constructor -------------------- //

        function Person( args ){

            var self = this,
                data = {};
        
            // Keep a reference to all unresolved promises
            self.promises = {};

            self.onChangeCallbacks = [];

            self.onPropertyChangeCallbacks = {};

            // Loop through all the properties and set them up
            _.each( properties, function( propertyConfig, propertyName ){

                // Setup the properties in the data object
                data[ propertyName ] = {

                    // This flag is used to prevent the app from trying 
                    // to reload this property over and over while in progress
                    isLoading : false,

                    // We need to know if the property has actually been loaded
                    // because it being undefined null may be it's actual value
                    isPopulated: args[ propertyName ] ? true : false,

                    // Save the actual value of the property
                    value: args[ propertyName ] || null

                };

                // Define a getter/setter for each property
                Object.defineProperty( self, propertyName, {
                    get: function() {

                        // Load the data if it doesn't exist, hasn't 
                        // been populated, and is isn't currently being
                        // loaded
                        if( !data[ propertyName ].value &&
                            !data[ propertyName ].isPopulated &&
                            !data[ propertyName ].isLoading ){

                            console.log( propertyName + ' not loaded. Retrieving from server.' );

                            data[ propertyName ].isLoading = true;

                            self.fetch().then(function( response ){
                                data[ propertyName ].isLoading = false;
                                data[ propertyName ].isPopulated = true;
                                data[ propertyName ].value = response.data[ propertyName ];
                            });

                        }

                        return data[ propertyName ].value;

                    },
                    set: function( value ){

                        // Verify the type is correct and warn the developer if not.
                        // Not sure if this is a good idea. Just showing what could
                        // be done.
                        if( !isValid( propertyConfig.type, value ) ){
                            console.warn( propertyName + ' set to invalid type.' );
                        }

                        data[ propertyName ].value = value;

                        // Alert any subscribers of changes
                        if( self.onChangeCallbacks.length ){
                            _.each( self.onChangeCallbacks, function( callback ){
                                callback();
                            });
                        }

                    }
                });

            });

        }

        // -- Public ------------------------ //

        // Deletes the object from the server
        Person.prototype.del = function(){};

        // Fetch the data from the server
        Person.prototype.fetch = function(){

            var self = this;

            if( self.promises.fetch ){
                return self.promises.fetch.promise;
            }

            self.promises.fetch = $q.defer();

            $http.get( '/person.json' ).then(
                function( response ){
                    // Simulate a long request
                    $timeout(function(){
                        self.promises.fetch.resolve( response );
                        delete self.promises.fetch;
                    }, 2000);
                },
                function(){
                    self.promises.fetch.reject();
                    delete self.promises.fetch;
                }
            );
            
            return self.promises.fetch.promise;
            
        };

        // Listen for ANY changes on the object
        Person.prototype.onChange = function( callback ){

            this.onChangeCallbacks.push( callback );
        
        };

        // Allows changes on a specific property to be listened for
        Person.prototype.onPropertyChange = function( propertyName ){};

        // Save any changes to the server
        Person.prototype.save = function(){};

        // Validates the properties and returns any errors
        Person.prototype.validate = function(){};

        // -- Private ---------------------- //

        // Check the type of the value
        function isValid( type, value ){
            return true;
        }

        return Person;

    }



    function MainController( Person, $timeout ){
        
        var vm = this;

        vm.people = [
            { id: 1, firstName: 'John', lastName: 'Doe' },
            { id: 2, firstName: 'Bob', lastName: 'Smith' },
            { id: 3, firstName: 'Paul', lastName: 'Martin' },
        ];

        vm.people = vm.people.map(function( personData ){
            return new Person( personData );
        });

        // Listen for a change on the model
        vm.people[0].onChange(function(){
            console.log( vm.people[0].firstName + " changed!" );
        });

        $timeout(function(){
            vm.people[0].lastName = "Foo";
        },5000);

    }



    angular.module( 'dm:autoLoad', [] )
        .factory( 'Person', PersonFactory )
        .controller( 'MainController', MainController );

})();
