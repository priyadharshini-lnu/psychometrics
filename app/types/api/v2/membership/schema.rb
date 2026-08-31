# frozen_string_literal: true

module Api
  module V2
    module Membership
      class Schema < Api::Base::Schema
        def self.resource
          'memberships'
        end

        def self.attributes(attribute, type)
          proc do
            if %i[create update].include?(type)
              optional(:user_id).array(:string)
              optional(:client_id).maybe(:string)
              optional(:project_id).maybe(:string)
              optional(:campaign_id).maybe(:string)
            end
            attribute[:role].filled(:string)
            attribute[:grant_names].filled(:hash).schema do
              %i[
                clients projects project_settings campaigns dashboards
                messages sms_invites results registration_codes communications
                assessors reports datasheets
              ].map do |grant_name_key|
                optional(grant_name_key).array(:str?)
              end
            end
            optional(:first_name).filled(:string)
            optional(:last_name).filled(:string)
            optional(:email).filled(:string)
          end
        end

        def self.relationships(_)
          [
            { name: :admin_roles, resource: :admin_roles, relationship: :many, required: false, allowed_blank: true }
          ]
        end
      end
    end
  end
end
