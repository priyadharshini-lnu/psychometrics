# frozen_string_literal: true

require 'simplecov'
require 'rspec/retry'
require 'rails_helper'

# See http://rubydoc.info/gems/rspec-core/RSpec/Core/Configuration
require 'support/mailer_macros'

RSpec.configure do |config|
  config.color = true
  config.extend(WithModel)
  config.include(MailerMacros)
  config.before(:each) { reset_email }

  config.before do
    ActiveStorage::Current.url_options = { host: 'example.com' }
  end

  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups

  config.verbose_retry = true
  config.display_try_failure_messages = true
  config.example_status_persistence_file_path = 'tmp/spec_examples.log'
  config.around :each, type: :feature do |ex|
    ex.run_with_retry retry: 3
  end
end
