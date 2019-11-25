# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module SubjectTable
        class SubjectRelationshipTable < BaseField
          def call
            broadcast :ok, subject_table
          end

          private

          def subject_table
            file_path = File.join(File.dirname(__FILE__), 'subject_relationship_table.html.erb')

            ActionController::Base.render file: file_path, assigns: { participants: participants }
          end

          def participants
            context[:threesixty_campaign].participants.
              where(evaluator_id: context[:evaluator].id, subject_id: context[:subject_ids]).
              includes(:relationship, :subject)
          end
        end
      end
    end
  end
end
