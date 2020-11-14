#!/bin/bash
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew update
#brew tap homebrew/dupes
#brew tap homebrew/php
brew remove nginx
brew remove php
brew remove mcrypt
composer global remove laravel/valet

#extras
brew remove wp-cli
brew remove mailhog
brew remove redis



#uninstall TODO