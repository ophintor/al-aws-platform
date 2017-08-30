ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../../Gemfile', __FILE__)

require 'rails/commands/server'
  module Rails
    class Server
      alias :default_options_alias :default_options
      def default_options
        default_options_alias.merge!(:Port => ENV['PORT'])
    end
  end
end

require 'bundler/setup' # Set up gems listed in the Gemfile.
