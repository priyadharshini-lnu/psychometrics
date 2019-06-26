# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module SubjectFields
        class Field < RecipientFields::Field
          def possible_fields
            {
              'Name' => :full_name,
              'Email' => :email,
              'FirstName' => :first_name,
              'LastName' => :last_name,
              'RelationshipName' => :relationship_name
            }
          end

          def relationship_name
            participant = context[:threesixty_campaign].participants.where(subject: context[:subject], evaluator: context[:evaluator]).first
            participant&.relationship&.name
          end

          def user
            context[:subject]
          end
        end
      end
    end
  end
end
