#!/bin/bash

# Run ./install.sh <env> from project root

# exit this script if anything fails
set -e

envFile=".env"

if [ ! -f "$envFile" ]; then
    echo "Missing $envFile file. Please setup .env file and try again."
    exit
fi

# https://stackoverflow.com/a/30969768/3837451
# Note: OS env vars will not override the env file env vars
set -o allexport
source $envFile
set +o allexport

# No parameter
if [ -z $1 ]; then
    # No build environment
    if [ -z $NODE_ENV ]; then
        echo "Please pass an environment argument: eg: ./install.sh local"
        echo "In lieu of this, you can also set NODE_ENV= in your systems' environment variables."
        exit
    # No parameter but build environment set
    else
        environment=$NODE_ENV
    fi
# Parameter should always override environment
else
    environment=$1
fi

echo "Environment: $environment"

# Install npm packages
yarn install

# Update memory size to 4gb to prevent webpack from throwing error "JS heap out of memory"
# https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-megabytes
export NODE_OPTIONS="--max-old-space-size=4096"

# Build
if [ "$environment" == "local" ]; then
    # development build
    yarn build-dev
else
    # production build
    yarn build
fi

cd ..

echo "Done!"
