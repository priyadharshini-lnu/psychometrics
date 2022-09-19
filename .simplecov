# frozen_string_literal: true

unless ENV['DISABLE_COVERAGE']
  require 'coveralls'
  Coveralls.wear!('rails')

  SimpleCov.start 'rails' do
    SimpleCov::Formatter::MultiFormatter.new([
      SimpleCov::Formatter::HTMLFormatter,
      Coveralls::SimpleCov::Formatter
    ])
  end
end
