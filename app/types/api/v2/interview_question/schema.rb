# frozen_string_literal: true

module Api
  module V2
    module InterviewQuestion
      class Schema < Api::Base::Schema
        def self.resource
          'interview_questions'
        end

        def self.attributes(attribute, _)
          proc do
            # Required fields
            attribute[:question].filled(:string)
            attribute[:description].filled(:string)
            attribute[:mandatory].filled(:bool)
            attribute[:time_limit].filled(:integer)
            attribute[:question_type].filled(:string)
          end
        end

        def self.relationships(_)
          [
            { name: :project, resource: :clients, relationship: :one, required: true }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
