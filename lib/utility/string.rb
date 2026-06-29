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

    def self.join_into_sentence(array)
      array.map { |v| "'#{v}'" }.to_sentence
    end

    def self.remove_non_ascii_chars(str)
      encoding_options = {
        invalid: :replace,          # Replace invalid byte sequences
        undef: :replace,            # Replace anything not defined in ASCII
        replace: '',                # Use a blank for those replacements
        universal_newline: true     # Always break lines with \n. \r is converted to \n
      }
      str.encode(Encoding.find('ASCII'), **encoding_options)
    end

    def self.generate_strong_password(length = 0)
      length = [12, length].max
      10.times do
        password = Devise.friendly_token.first(length - 4)
        special_chars = ['@', '#', '$', '%', '^', '&', '*']
        password += special_chars.sample
        password += [*'0'..'9'].sample
        password += [*'A'..'Z'].sample
        password += [*'a'..'z'].sample
        password = password.chars.shuffle.join

        return password unless has_repeated_substring?(password, max_occurrence: 3, min_substring_length: 1) ||
                               has_repeated_substring?(password, max_occurrence: 2, min_substring_length: 3) ||
                               has_sequence?(password)
      end
      password
    end

    def self.remove_csv_injection_marker(value)
      return value unless value.is_a?(::String)

      value.match?(::RegexConstants::CSV_INJECTION_PREFIX_PATTERN) ? value[1..] : value
    end

    def self.mask_secret(key)
      return nil if key.blank?

      key.length > 4 ? "#{'*' * (key.length - 4)}#{key[-4..]}" : key
    end
  end
end
