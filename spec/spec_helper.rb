require 'simplecov'
require 'rspec/retry'
require 'rails_helper'
require 'coveralls'

Coveralls.wear!('rails')

if ENV['CI_PROJECT_DIR']
  dir = File.join(ENV['CI_PROJECT_DIR'], "coverage")
  SimpleCov.coverage_dir(dir)
end
SimpleCov.start 'rails'do
  add_filter 'vendor'
end
# See http://rubydoc.info/gems/rspec-core/RSpec/Core/Configuration
require 'capybara/rspec'
require 'support/mailer_macros'
RSpec.configure do |config|
  config.color = true
  config.include(MailerMacros)
  config.before(:each) { reset_email }
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups

  config.verbose_retry = true
  config.display_try_failure_messages = true
  config.around :each, type: :feature do |ex|
    ex.run_with_retry retry: 3
  end
end
