#!/bin/bash

echo "0. User and pwd"
echo "user: "$(id)
echo "pwd: "$(pwd)

#first steps
echo "1. Updating and upgrading"
sudo apt-get update
sudo apt-get upgrade -y
printf '\n%s\n%s\n%s\n%s\n' 'export LC_CTYPE=en_US.UTF-8' 'export LC_ALL=en_US.UTF-8' 'export LANG=en_US.UTF-8' 'export LANGUAGE=en_US.UTF-8' >> ~/.profile
. ~/.profile
sudo locale-gen "en_US.UTF-8"
sudo touch /var/lib/cloud/instance/locale-check.skip

echo "2. Install mysql"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password password PASS"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password_again password PASS"
sudo apt-get -y install mysql-server
mysql -uroot -pPASS -e "SET PASSWORD = PASSWORD('');"
sudo sed -i 's/bind-address/#bind-address/g' /etc/mysql/my.cnf
sudo service mysql restart
mysql --user="root" --password="" --execute="GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '';"
mysql --user="root" --password="" --execute="CREATE DATABASE sequelize_test;"
