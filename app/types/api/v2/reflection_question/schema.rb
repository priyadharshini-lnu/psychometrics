# frozen_string_literal: true

module Api
  module V2
    module ReflectionQuestion
      class Schema < Api::Base::Schema
        def self.resource
          'reflection_questions'
        end

        def self.attributes(attribute, _)
          proc do
            # Required fields
            attribute[:question].filled(:string)
            attribute[:mandatory].filled(:bool)

            optional(:min_words).maybe(:int?)
            optional(:max_words).maybe(:int?)
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
