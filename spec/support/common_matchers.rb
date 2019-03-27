# encoding: UTF-8

require 'rspec/expectations'

module CommonMatchers
  RSpec::Matchers.define :be_url do |expected|
    # The match method, returns true if valid, false if not.
    match do |actual|
      !!(actual =~ URI::regexp)
    end
  end
end
