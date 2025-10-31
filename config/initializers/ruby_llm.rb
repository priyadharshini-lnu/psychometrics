# frozen_string_literal: true

require 'ruby_llm'

RubyLLM.configure do |config|
  config.openai_api_key = ENV.fetch('OPENAI_API_KEY', 'no-token')

  config.default_model = 'gpt-4o'
  config.log_level = Rails.env.development? ? :debug : :info

  if Rails.env.development?
    config.log_file = 'log/ruby_llm.log'
  end

  config.use_new_acts_as = true
end

# Adding custom keys for oci provider
RubyLLM::Configuration.class_eval do
  attr_accessor :oci_model_id,
                :oci_generative_ai_api_base
end

# Register the OCI provider after the application is initialized
Rails.application.config.after_initialize do
  RubyLLM::Provider.register :oci, AI::Providers::Oci
end
