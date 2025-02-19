# frozen_string_literal: true

module EndUser
  class IdpPlanSchema < BaseSchema
    # rubocop:disable Metrics/AbcSize
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:status).filled(:str?, included_in?: UserIdpPlan.statuses.keys)

        optional(:user_idp_skills).array(:hash) do
          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:description).maybe(:str?)
          required(:category).filled(:str?)
          required(:initial_rating) { nil? | (int? | float?) }
          required(:final_rating) { nil? | (int? | float?) }
          required(:skill_id).filled(:int?)
        end

        optional(:user_idp_development_actions).array(:hash) do
          required(:id).filled(:int?)
          required(:development_action_id).maybe(:int?)
          required(:name).maybe(:str?)
          required(:description).maybe(:str?)
          required(:learning_style).maybe(:str?)
          required(:image).maybe(:str?)
          required(:user_idp_skill_id).filled(:int?)
          required(:custom_action).maybe(:str?)
          required(:progress).filled(:int?)
          required(:start_date_time).maybe(:str?)
          required(:end_date_time).maybe(:str?)
          required(:private).filled(:bool?)
        end
      end
    end
    # rubocop:enable Metrics/AbcSize
  end
end
