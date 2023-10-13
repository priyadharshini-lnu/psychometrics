# frozen_string_literal: true

module Utility
  class Number
    def self.scale(value, in_min, in_max, out_min, out_max)
      return 0 if value < in_min || value > in_max

      (((out_max - out_min) * (value - in_min)).to_f / (in_max - in_min)) + out_min
    end
  end
end
