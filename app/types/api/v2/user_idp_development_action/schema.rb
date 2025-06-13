# frozen_string_literal: true

module Api
  module V2
    module UserIdpDevelopmentAction
      class Schema < Api::Base::Schema
        def self.resource
          'user_idp_development_actions'
        end

        def self.attributes(_attribute, _type)
          proc do
            required(:user_idp_development_actions).array(:hash) do
              required(:user_idp_skill_id).filled(:integer)
              optional(:development_action_id).maybe(:integer)
              optional(:user_idp_plan_id).filled(:integer)
              optional(:custom_action).maybe(:string)
              optional(:custom_action_learning_style).maybe(:string)
              optional(:start_date_time).maybe(:string)
              optional(:end_date_time).maybe(:string)
            end
          end
        end

        def self.bulk_update
          json_api_attributes do
            required(:user_idp_development_actions).array(:hash) do
              optional(:id).maybe(:integer)
              optional(:user_idp_skill_id).maybe(:integer)
              optional(:development_action_id).maybe(:integer)
              optional(:user_idp_plan_id).maybe(:integer)
              optional(:custom_action).maybe(:string)
              optional(:custom_action_learning_style).maybe(:string)
              optional(:start_date_time).maybe(:string)
              optional(:end_date_time).maybe(:string)
            end
          end
        end
      end
    end
  end
end
