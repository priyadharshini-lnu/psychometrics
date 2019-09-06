ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
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

Dir[Rails.root.join('spec/support/**/*.rb')].sort.each { |f| require f }

Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end

ActiveRecord::Migration.maintain_test_schema!
Psychometrics::Application.load_tasks
# Needs for able to stub methods inside FactoryGirl
FactoryGirl::SyntaxRunner.class_eval do
  include RSpec::Mocks::ExampleMethods
end

RSpec.configure do |config|
  config.color = true
  config.include Features::Helpers, type: :feature
  config.include AbstractController::Translation
  config.include FactoryGirl::Syntax::Methods
  config.include Warden::Test::Helpers
  config.include Rectify::RSpec::Helpers
  config.include(Wisper::RSpec::BroadcastMatcher)
  # Sign in helper for controller
  config.include Devise::Test::ControllerHelpers, type: :controller
  config.extend ControllerMacros, type: :controller
  config.include Devise::Test::IntegrationHelpers, type: :request

  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
  # config.filter_gems_from_backtrace("gem name")

  config.before(:each) { Timecop.freeze(Time.local(2018, 9, 15, 9, 31, 42)) }
  config.after(:each) { Timecop.return }

  config.before(:suite) do
    DatabaseCleaner.strategy = :deletion
    DatabaseCleaner.clean_with(:truncation)
    DatabaseCleaner.clean
  end

  config.after(:suite) do
    DownloadHelpers.clear_downloads
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
    if ENV['CIRCLECI'] && example.example_group.include?(Capybara::DSL) && Capybara.page.current_url != '' && example.exception
      save_timestamped_screenshot(Capybara.page, example.metadata)
    end
  end

  [:controller, :view, :request].each do |type|
    config.include ::Rails::Controller::Testing::TestProcess, :type => type
    config.include ::Rails::Controller::Testing::TemplateAssertions, :type => type
    config.include ::Rails::Controller::Testing::Integration, :type => type
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
