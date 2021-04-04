#!/bin/bash
if [[ $(command -v brew) == "" ]]; then
    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
fi
#brew tap homebrew/dupes
#brew tap homebrew/php
brew install nginx php mcrypt mariadb wp-cli mailhog redis
#install database
brew services start mariadb
#Add import dirs to PATH
#echo 'export PATH="/usr/local/opt/mysql@5.7/bin:$PATH"' >> ~/.bash_profile
echo 'export PATH="$HOME/.composer/vendor/bin:$PATH"' >> ~/.bash_profile
#resource the terminal
source ~/.bash_profile
#installing Valet
composer global require laravel/valet
valet install
#make the directories
mkdir -p ~/Sites
cd ~/Sites
#set the default .tld to .test
valet trust
valet domain test
valet park
#extras
#setup a mysql password
sudo $(brew --prefix mariadb)/bin/mysqladmin -u root password 2801
mysql -uroot -p2801 -e "\
CREATE USER IF NOT EXISTS wp@'localhost' IDENTIFIED BY 'wp'; \
GRANT ALL PRIVILEGES  on *.* to wp@'localhost'; \
GRANT ALL PRIVILEGES ON *.* TO 'wp'@'localhost' IDENTIFIED BY 'wp' WITH GRANT OPTION; \
FLUSH PRIVILEGES; \
"
#Add a root password for yourself
#mysql_secure_installation
#Speed Up PHP
sed -ie 's/128M/2048M/g' /usr/local/etc/php/7.3/conf.d/php-memory-limits.ini
sed -ie 's/512M/2048M/g' /usr/local/etc/php/7.3/conf.d/php-memory-limits.ini
#Install Valet WP-CLI
wp package install git@github.com:aaemnnosttv/wp-cli-valet-command.git
valet restart
#UPGRADE wp cli update
#update Valet
#composer global update
#valet install
#PHP.ini file
#/usr/local/etc/php/7.3/php.ini
#memory limits
#/usr/local/etc/php/7.3/conf.d/php-memory-limits.ini
#nginx file
#my.cnf
#/usr/local/etc/my.cnf
#STOP mysql brew services stop mysql@5.7