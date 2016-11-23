module.exports = function(grunt) {

    var vendorDir = 'src/main/resources/public/assets/vendor',
        nodeDir = 'node_modules';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            vendors: [vendorDir]
        },

        copy: {
            'all': {
                files: [{
                    expand: true,
                    cwd: nodeDir,
                    src: [
                        'angular/**/*.js',
                        'angular/**/*.map',
                        'angular-chart.js/**/*.js',
                        'underscore/**/*min.js',
                        'jquery/**/*min.js',
                        'tether/**/*min.js',
                        'moment/**/*min.js',
                        'bootstrap/dist/js/bootstrap.min.js',
                        'chart.js/**/*min.js',
                        'angular-chart.js/**/*min.js',
                        'angularjs-slider/dist/*min.*',
                        'd3/build/*min.js'
                    ],
                    dest: vendorDir
                }]
            },
            'bootstrap': {
                files: [{
                    expand: true,
                    cwd: nodeDir + '/bootstrap',
                    src: '**/*.scss',
                    dest: 'src/main/sass/bootstrap/'
                }]
            },

            'bootstrap-slider': {
                files: [{
                    expand: true,
                    cwd: nodeDir + '/bootstrap-slider',
                    src: '**/*.scss',
                    dest: 'src/main/sass/bootstrap-slider/'
                }]
            },

            'font-awesome': {
                files: [{
                    expand: true,
                    cwd: nodeDir + '/components-font-awesome',
                    src: '**/*.scss',
                    dest: 'src/main/sass/font-awesome/'
                }, {
                    expand: true,
                    cwd: nodeDir + '/components-font-awesome',
                    src: 'fonts/**/*',
                    dest: vendorDir + '/components-font-awesome/',
                }]


            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },

            all: ['Gruntfile.js', 'src/main/resources/public/assets/js/*.js']
        },

        coffee: {
            compile: {
                options: {
                    join: true,
                    bare: true,
                    sourceMap: true
                },
                files: {
                    'src/main/resources/public/assets/build/all.js': 'src/main/coffee/*.coffee' // 1:1 compile
                },
                expand: true,
                flatten: true
                    // bare: true,
                    // cwd: 'src/main/coffee',
                    // src: ['*.coffee'],
                    // dest: 'src/main/resources/public/assets/build/',
                    // ext: '.js'
            }
        },

        sass: {
            dist: {
                files: {
                    'src/main/resources/public/assets/css/az.css': 'src/main/sass/az.scss'
                }
            }
        },

        watch: {
            coffee: {
                files: [
                    'src/main/coffee/*.coffee'
                ],
                tasks: ['coffee:compile']
            },

            css: {
                files: 'src/main/sass/*.scss',
                tasks: ['sass']
            },
        }

    });



    //grunt.registerTask('default', ['watch']);

    grunt.registerTask('createVendorDir', 'Creates the necessary vendor directory', function() {
        // Create the vendorDir when it doesn't exists.
        if (!grunt.file.isDir(vendorDir)) {
            grunt.file.mkdir(vendorDir);

            // Output a success message
            grunt.log.oklns(grunt.template.process(
                'Directory "<%= directory %>" was created successfully.', {
                    data: {
                        directory: vendorDir
                    }
                }
            ));
        }
    });

    grunt.registerTask('default', ['clean', 'createVendorDir', 'copy']);
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
};
