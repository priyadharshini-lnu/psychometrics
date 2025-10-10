# frozen_string_literal: true

module Api
  module V2
    module IdpSetting
      class Schema < Api::Base::Schema
        def self.resource
          'idp_settings'
        end

        def self.attributes(_attribute, _)
          proc do
            optional(:manager_approves_idp).maybe(:bool)
            optional(:manager_can_edit_idp).maybe(:bool)
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
