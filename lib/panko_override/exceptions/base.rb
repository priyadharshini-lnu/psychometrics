# frozen_string_literal: true

module PankoOverride
  module Exceptions
    class Base < StandardError
      private_attr_reader :meta

      def meta
        {}
      end
    end
  end
end
