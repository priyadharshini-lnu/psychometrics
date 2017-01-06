# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
# Prevent database truncation if the environment is production
abort('The Rails environment is running in production mode!') if Rails.env.production?
require 'spec_helper'
require 'rspec/rails'
require 'capybara/rspec'
require 'capybara/poltergeist'
require 'capybara-screenshot/rspec'
require 'selenium-webdriver'
# require 'features/helpers'

ActiveRecord::Migration.maintain_test_schema!

RSpec.configure do |config|
  Dir[Rails.root.join('spec/support/**/*.rb')].sort.each { |f| require f }
  config.include Features::Helpers, type: :feature
  config.include AbstractController::Translation
  config.include FactoryGirl::Syntax::Methods
  config.include Warden::Test::Helpers

  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
  # config.filter_gems_from_backtrace("gem name")

  Capybara.register_driver :poltergeist do |app|
    options = {
        js_errors: false,
        timeout: 80,
        debug: false,
        phantomjs_options: ['--load-images=no', '--disk-cache=false', '--web-security=false'],
        inspector: true,
        window_size: [1366, 768]
    }
    Capybara::Poltergeist::Driver.new(app, options)
  end

  Capybara.register_driver :chrome do |app|
    # optional
    client = Selenium::WebDriver::Remote::Http::Default.new
    client.read_timeout = 120
    profile = Selenium::WebDriver::Chrome::Profile.new
    profile['download.default_directory'] = DownloadHelpers::PATH.to_s
    Capybara::Selenium::Driver.new(app, browser: :chrome, http_client: client, profile: profile)
  end

  Capybara::Screenshot.register_driver(:chrome) do |driver, path|
    driver.browser.save_screenshot(path)
  end

  Capybara.configure do |c|
    c.app_host = 'http://lvh.me:31338'
    c.server_port = 31_338
  end

  Capybara.default_driver = :poltergeist
  Capybara.javascript_driver = :chrome

  config.before(:suite) do
    DatabaseCleaner.strategy = :deletion
    DatabaseCleaner.clean_with(:truncation)
    DatabaseCleaner.clean
  end

  config.after(:suite) do
    DownloadHelpers.clear_downloads
  end

  config.around(:each) do |example|
    DownloadHelpers.clear_downloads

    if self.class.metadata[:clean] == false
      example.run
    else
      DatabaseCleaner.cleaning do
        example.run
      end
    end
  end

  Capybara::Screenshot.autosave_on_failure = ENV['CIRCLECI'].nil? # skip for circleci artifacts

  config.after(:each) do |example|
    # For CircleCI
    if ENV['CIRCLECI'] && example.example_group.include?(Capybara::DSL) && Capybara.page.current_url != '' && example.exception
      save_timestamped_screenshot(Capybara.page, example.metadata)
    end
  end

  def save_timestamped_screenshot(page, meta)
    filename = File.basename(meta[:file_path])
    line_number = meta[:line_number]
    screenshot_name = "#{filename}-#{line_number}.#{Time.now.usec / 1_000}.png"
    screenshot_path = "#{ENV.fetch('CIRCLE_ARTIFACTS', Rails.root.join('tmp/capybara'))}/#{screenshot_name}"

    page.save_screenshot(screenshot_path)
    puts "\n  Screenshot: #{screenshot_path}"
  end
end
