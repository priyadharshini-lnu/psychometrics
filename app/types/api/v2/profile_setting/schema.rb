# frozen_string_literal: true

module Api
  module V2
    module ProfileSetting
      class Schema < Api::Base::Schema
        def self.resource
          'profile_settings'
        end

        def self.attributes(attribute, _)
          proc do
            optional(:update_in).maybe(:string)
            required(:profile_fields).array do
              attribute[:question_id].filled(:integer)
              attribute[:required].filled(:bool)
              attribute[:half_size].filled(:bool)
            end
          end
        end

        def self.relationships(_)
          [
            { name: :project, resource: :projects, relationship: :one }
          ]
        end
      end
    end
  end
end
