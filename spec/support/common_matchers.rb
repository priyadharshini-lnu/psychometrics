# frozen_string_literal: true

require 'rspec/expectations'

module CommonMatchers
  RSpec::Matchers.define :be_url do |_expected|
    # The match method, returns true if valid, false if not.
    match do |actual|
      !!(actual =~ URI::DEFAULT_PARSER.make_regexp)
    end
  end
end
