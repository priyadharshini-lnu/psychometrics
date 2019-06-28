# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module RecipientFields
        class Field < BaseField
          def call
            method_name = possible_fields[path.second]
            return broadcast :ok, '' unless method_name

            broadcast :ok, send(method_name)
          end

          protected

          def possible_fields
            {
              'Name' => :full_name,
              'Email' => :email,
              'FirstName' => :first_name,
              'LastName' => :last_name
            }
          end

          def full_name
            user.decorate.full_name
          end

          def email
            user.email
          end

          def first_name
            user.first_name
          end

          def last_name
            user.last_name
          end

          def user
            context[:recipient]
          end
        end
      end
    end
  end
end
