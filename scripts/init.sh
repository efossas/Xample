#!/bin/bash

if [ "$(uname)" == "Darwin" ]; then
  brew update
  brew install imagemagick
  brew install mysql
  brew install unoconv
  brew install node
  brew cask install atom

  if [ ! -e /var/mysql ]; then
    sudo mkdir /var/mysql
    sudo ln -s /tmp/mysql.sock /var/mysql/mysql.sock
  fi
fi

echo "Install Atom Plugins? (y/n)"
read response
if [ "$response" == "y" ]; then
  apm install linter-eslint
  apm install minimap
  apm install jumpy
  apm install file-icons
  apm install pigments
  apm install color-picker
  apm install file-icons
  apm install atom-minify
  apm install terminal-plus
  apm install atom-minify
  apm install script
  apm install git-plus
  apm install merge-conflicts
  apm install git-time-machine
  apm install data-atom
  apm install remote-ftp
  apm install atom-typescript
fi
