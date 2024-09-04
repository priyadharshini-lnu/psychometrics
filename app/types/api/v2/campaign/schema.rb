# frozen_string_literal: true

module Api
  module V2
    module Campaign
      class Schema < Api::Base::Schema
        def self.resource
          'campaigns'
        end

        def self.attributes(_attribute, _)
          proc do
          end
        end

        def self.relationships(_)
          [
            { name: :default_idp_template, resource: :idp_templates, relationship: :one, allowed_blank: true },
            {
              name: :threesixty_campaign,
              resource: :threesixty_campaigns,
              relationship: :one,
              required: false,
              allowed_blank: true
            }
          ]
        end
      end
    end
  end
end
