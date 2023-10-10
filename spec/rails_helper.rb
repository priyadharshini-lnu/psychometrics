# frozen_string_literal: true

ENV['RAILS_ENV'] = 'test'
require File.expand_path('../config/environment', __dir__)
abort('The Rails environment is running in production mode!') if Rails.env.production?

require 'spec_helper'
require 'rspec/rails'
require 'capybara/rspec'
require 'capybara-screenshot/rspec'
require 'selenium-webdriver'
require 'features/helpers'
require 'wisper/rspec/matchers'
require 'rectify/rspec'
require 'capybara_config'
require 'rspec/mocks'
require 'webmock/rspec'
require 'savon/mock/spec_helper'
require 'redlock/testing'

Redlock::Client.testing_mode = :bypass

Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end

ActiveRecord::Migration.maintain_test_schema!
Psychometrics::Application.load_tasks
# Needs for able to stub methods inside FactoryBot
FactoryBot::SyntaxRunner.class_eval do
  include RSpec::Mocks::ExampleMethods
end

RSpec.configure do |config|
  config.color = true
  config.include Features::Helpers, type: :feature
  config.include AbstractController::Translation
  config.include FactoryBot::Syntax::Methods
  config.include Warden::Test::Helpers
  config.include Rectify::RSpec::Helpers
  config.include(Wisper::RSpec::BroadcastMatcher)
  # Sign in helper for controller
  config.include Devise::Test::ControllerHelpers, type: :controller
  config.include ControllerMacros, type: :controller
  config.include ControllerMacros, type: :request
  config.include Support::Response, type: :request
  config.include Devise::Test::IntegrationHelpers, type: :request
  config.include Capybara::RSpecMatchers, type: :controller
  config.include Savon::SpecHelper
  config.include SamlHelper
  config.include JsonApiHelper
  config.include CommandHelper
  config.render_views

  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
  # config.filter_gems_from_backtrace("gem name")

  config.before(:each) { Timecop.freeze(Time.zone.local(2018, 9, 15, 9, 31, 42)) }
  config.after(:each) { Timecop.return }

  config.before(:suite) do
    DatabaseCleaner.strategy = :deletion, { except: %w[data_geos] }
    DatabaseCleaner.clean_with(:truncation)
    DatabaseCleaner.clean
  end

  config.before(:all) do
    FactoryBot.reload
    WebMock.allow_net_connect!
  end

  config.before(:suite) do
    DummyTables.drop
    DummyTables.create
  end

  config.after(:suite) do
    DummyTables.drop
  end

  config.after(:suite) do
    DownloadHelpers.clear_downloads unless ENV.key? 'TEST_ENV_NUMBER'
  end

  config.around(:each) do |example|
    if self.class.metadata[:clean] == false
      example.run
    else
      DatabaseCleaner.cleaning { example.run }
    end
  end

  Capybara::Screenshot.autosave_on_failure = ENV['CIRCLECI'].nil? # skip for circleci artifacts

  config.after(:each) do |example|
    if ENV.fetch('CIRCLECI', nil) &&
       example.example_group.include?(Capybara::DSL) && Capybara.page.current_url != '' && example.exception
      save_timestamped_screenshot(Capybara.page, example.metadata)
    end
  end

  %i[controller view request].each do |type|
    config.include ::Rails::Controller::Testing::TestProcess, type: type
    config.include ::Rails::Controller::Testing::TemplateAssertions, type: type
    config.include ::Rails::Controller::Testing::Integration, type: type
  end

  def save_timestamped_screenshot(page, meta)
    filename = File.basename(meta[:file_path])
    line_number = meta[:line_number]
    screenshot_name = "#{filename}-#{line_number}.#{Time.zone.now.usec / 1_000}.png"
    screenshot_path = "#{ENV.fetch('CIRCLE_ARTIFACTS', Rails.root.join('tmp/capybara'))}/#{screenshot_name}"

    page.save_screenshot(screenshot_path)
    puts "\n  Screenshot: #{screenshot_path}"
  end
end
