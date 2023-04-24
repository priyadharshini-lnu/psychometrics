# frozen_string_literal: true

require 'browser'

module Browser
  class << self
    alias old_matchers matchers
  end

  def self.matchers
    @matchers = old_matchers.unshift Browsers::Examus
  end
end
