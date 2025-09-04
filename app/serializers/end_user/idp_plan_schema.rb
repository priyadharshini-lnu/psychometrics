# frozen_string_literal: true

module EndUser
  class IdpPlanSchema < BaseSchema
    # rubocop:disable Metrics/AbcSize
    # rubocop:disable Metrics/BlockLength
    def self.schema(context, options)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:status).filled(:str?, included_in?: UserIdpPlan.statuses.keys)
        required(:skill_gap_report_available).filled(:bool?)
        required(:self_rating_enabled).filled(:bool?)
        required(:user).hash(IdpUserSchema.schema(context, options))
        required(:unread_comments_count).filled(:int?)
        required(:instructions).maybe do
          hash do
            optional(:content).filled(:str?)
          end
        end

        optional(:user_idp_skills).array(:hash) do
          required(:id).filled(:int?)
          required(:name).filled(:str?)
          required(:description).maybe(:str?)
          required(:skill_type).filled(:str?)
          required(:initial_rating) { nil? | (int? | float?) }
          required(:final_rating) { nil? | (int? | float?) }
          required(:skill_id).filled(:int?)
          required(:private).filled(:bool?)
        end

        optional(:reflection_questions).array(:hash) do
          required(:id).filled(:int?)
          required(:mandatory).filled(:bool?)
          required(:question).filled(:str?)
          required(:min_words).maybe(:int?)
          required(:max_words).maybe(:int?)
          optional(:answer).maybe(:str?)
        end

        optional(:user_idp_development_actions).array(:hash) do
          required(:id).filled(:int?)
          required(:development_action_id).maybe(:int?)
          required(:name).maybe(:str?)
          required(:description).maybe(:str?)
          required(:learning_style).maybe(:str?)
          required(:custom_action_learning_style).maybe(:str?)
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
    # rubocop:enable Metrics/BlockLength
  end
end
