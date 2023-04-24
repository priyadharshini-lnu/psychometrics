# frozen_string_literal: true

module Browsers
  class Examus < Browser::Base
    def id
      :examus
    end

    def name
      'Examus'
    end

    def full_version
      ua[%r{examus-electron/([\d.]+)}, 1]
    end

    def match?
      ua.include? 'examus-electron'
    end
  end
end
