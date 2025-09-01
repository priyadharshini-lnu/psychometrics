# frozen_string_literal: true

require 'ruby_llm'

RubyLLM.configure do |config|
  config.openai_api_key = ENV.fetch('OPENAI_API_KEY', 'no-token')

  config.default_model = 'gpt-4o'
  config.log_level = Rails.env.development? ? :debug : :info

  if Rails.env.development?
    config.log_file = 'log/ruby_llm.log'
  end
end
