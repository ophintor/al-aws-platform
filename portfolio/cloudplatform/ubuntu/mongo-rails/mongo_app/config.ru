# This file is used by Rack-based servers to start the application.

# ENV['GEM_PATH']="/app/vendor/gems:#{ENV['GEM_HOME']}"
# ENV['GEM_HOME']="#{ENV['HOME']}/projects/shared/gems/ruby/1.8/gems"
# ENV['GEM_PATH']="#{ENV['GEM_HOME']}:/var/lib/ruby/gems/1.8"
# require 'rubygems'
# Gem.clear_paths
require ::File.expand_path('../config/environment', __FILE__)
run Rails.application
