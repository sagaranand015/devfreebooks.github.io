const harp = require('./harp.json');

module.exports = (grunt) => {
  const config = {
    // Clean folders =================================
    clean: {
      www: ['www']
    },
    // ENV vars ======================================
    env: {
      dev: {
        NODE_ENV: 'development'
      },
      prod: {
        NODE_ENV: 'production'
      }
    },
    // Stylus ========================================
    stylus: {
      main: {
        options: { compress: true },
        files: {
          'public/assets/css/application.css': 'public/assets/css/_application.styl'
        }
      }
    },
    // Compress ======================================
    compress: {
      main: {
        options: {
          mode: 'gzip',
          level: 9,
          pretty: true
        },
        files: [
          { expand: true, flatten: true, src: ['www/assets/js/*.js'], dest: 'www/assets/js', ext: '.gz.js' },
          { expand: true, flatten: true, src: ['www/assets/css/*.css'], dest: 'www/assets/css', ext: '.gz.css' }
        ]
      }
    },
    // Image Optim ===================================
    imagemin: {
      dynamic: {
        files: [{
          expand: true,
          cwd: 'public/assets/images',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'public/assets/images'
        }]
      }
    },
    // Exec Feed Generator ===========================
    shell: {
      feed: {
        command: 'mkdir -p www && node feed.js'
      },
      categories: {
        command: 'node categories.js'
      }
    },
    // Manifest ======================================
    appcache: {
      options: {
        basePath: 'www',
        baseUrl: harp.globals.root_url.production
      },
      all: {
        dest: 'www/manifest.appcache',
        cache: 'www/**/*',
        network: '*'
      }
    },
    // Sitemap =======================================
    sitemaps: {
      default: {
        options: {
          baseUrl: harp.globals.root_url.production,
          contentRoot: 'www/',
          dest: 'www/'
        },
        files: [{
          expand: true,
          cwd: 'www/',
          src: '**/*.html'
        }]
      }
    },
    // SW PreCache ===================================
    'sw-precache': {
      options: {
        baseDir: 'www',
        cacheId: harp.globals.slug_title,
        workerFileName: 'sw.js',
        verbose: true,
        handleFetch: true
      },
      default: {
        staticFileGlobs: [
          'index.html',
          '404.html',
          'manifest.json',
          'robots.txt',
          'manifest.appcache',
          'favicon.ico',
          'assets/**/*.{css,js,woff,ttf,svg,eot,gif,png,jpg,jpeg}',
          '**/index.html'
        ]
      }
    },
    // Github Pages ==================================
    'gh-pages': {
      options: {
        base: 'www',
        repo: harp.globals.github_repo,
        message: `Deploying ${harp.globals.title}`,
        branch: 'master'
      },
      src: '**/*'
    }
  };

  grunt.initConfig(config);
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-appcache');
  grunt.loadNpmTasks('grunt-sw-precache');
  grunt.loadNpmTasks('grunt-sitemaps');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('prebuild:dev', ['clean', 'env:dev', 'shell:categories', 'stylus', 'imagemin']);
  grunt.registerTask('prebuild:prod', ['clean', 'env:prod', 'shell:categories', 'stylus', 'imagemin']);
  grunt.registerTask('build:prod', ['shell:feed', 'appcache', 'sw-precache', 'compress', 'sitemaps']);
  grunt.registerTask('deploy:prod', ['gh-pages', 'clean']);
};
