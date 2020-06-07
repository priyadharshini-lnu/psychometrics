# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module UserFields
        class Field < BaseField
          def call
            method_name = possible_fields[path.second]
            return broadcast :ok, '' unless method_name

            broadcast :ok, send(method_name)
          end

          protected

          def possible_fields
          end
        end
      end
    end
  end
end
