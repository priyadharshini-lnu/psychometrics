# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module DateTimeFields
        class Other < BaseField
          SIGNS = {
            '-' => :-,
            '+' => :+
          }.freeze
          TYPES = {
            'd' => :day,
            'w' => :week,
            'y' => :year
          }.freeze

          PREFIX_MATCHER = /([+-])(\d)(\w)/.freeze

          def call
            prefix = path.last
            format = params['f']
            time = perform_with_prefix(prefix)
            broadcast :ok, time.strftime(format)
          rescue Exception => e
            broadcast :ok, ''
          end

          private

          def perform_with_prefix(prefix)
            matches = prefix.match(PREFIX_MATCHER)
            sign = matches[1]
            count = matches[2].to_i
            Time.now.send(SIGNS[sign], count.send(TYPES[matches[3]]))
          end
        end
      end
    end
  end
end
