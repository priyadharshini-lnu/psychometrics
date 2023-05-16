# frozen_string_literal: true

module Utility
  class String
    def self.has_repeated_substring?(str, max_occurrence:, min_substring_length:)
      return true if /(.{#{min_substring_length},}).*\1{#{max_occurrence - 1},}/.match?(str)

      false
    end

    def self.has_sequence?(str, seq_length: 3)
      str.chars.slice_when { |x, y| y != x.next }.any? { |a| a.size >= seq_length }
    end
  end
end
