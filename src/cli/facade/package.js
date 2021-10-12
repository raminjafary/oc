'use strict';

const strings = require('../../resources/index').default;
const path = require('path');
const handleDependencies = require('../domain/handle-dependencies').default;

module.exports = function(dependencies) {
  const local = dependencies.local,
    logger = dependencies.logger;

  return function(opts, callback) {
    const componentPath = opts.componentPath,
      useComponentDependencies = opts.useComponentDependencies,
      packageDir = path.resolve(componentPath, '_package'),
      compressedPackagePath = path.resolve(componentPath, 'package.tar.gz');

    logger.warn(strings.messages.cli.PACKAGING(packageDir));
    handleDependencies(
      {
        components: [path.resolve(componentPath)],
        logger,
        useComponentDependencies
      },
      err => {
        if (err) {
          logger.err(err);
          return callback(err);
        }
        const packageOptions = {
          production: true,
          componentPath: path.resolve(componentPath)
        };
        local.package(packageOptions, (err, component) => {
          if (err) {
            logger.err(strings.errors.cli.PACKAGE_CREATION_FAIL(err));
            return callback(err);
          }

          logger.ok(strings.messages.cli.PACKAGED(packageDir));

          if (opts.compress) {
            logger.warn(
              strings.messages.cli.COMPRESSING(compressedPackagePath)
            );

            local.compress(packageDir, compressedPackagePath, err => {
              if (err) {
                logger.err(strings.errors.cli.PACKAGE_CREATION_FAIL(err));
                return callback(err);
              }
              logger.ok(strings.messages.cli.COMPRESSED(compressedPackagePath));
              callback(null, component);
            });
          } else {
            callback(null, component);
          }
        });
      }
    );
  };
};
