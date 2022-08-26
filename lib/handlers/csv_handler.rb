# frozen_string_literal: true

require 'csv'

module Handlers
  module CsvHandler
    class CsvGenerator
      def self.generate(&)
        file = CSV.generate(&)
        file.html_safe
      end
    end

    class Handler
      def self.call(_template, source)
        %(
          ::Handlers::CsvHandler::CsvGenerator.generate do |csv|
            #{source}
          end
        )
      end
    end
  end
end
