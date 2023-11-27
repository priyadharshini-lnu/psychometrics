# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName
module EndUser
  class CampaignSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).filled(:int?)
        required(:name).filled(:str?)
        required(:type).filled(:str?)
        required(:status).filled(:str?)
        required(:start_date).maybe(:str?)
        required(:end_date).maybe(:str?)
        required(:groups).array(EndUser::GroupSchema.schema(_, _))
        required(:ungrouped_assessments_ids).maybe(:array?)
        required(:campaign_user).hash(EndUser::CampaignUserSchema.schema(_, _))
        required(:is_timed_campaign).maybe(:bool?)
        required(:campaigns_count).maybe(:int?)
        required(:user_reports_available).filled(:bool?)
        required(:privacy_consent_required).maybe(:bool?)
        required(:campaign_time).maybe(:int?)
        required(:fixed_timed).maybe(:bool?)
        required(:campaign_options).hash(EndUser::CampaignOptionsSchema.schema(_, _))
        required(:user_assessments).maybe do
          array(EndUser::UserAssessmentSchema.schema(_, _))
        end
        required(:workshop_invite).maybe(:hash, EndUser::WorkshopInviteSchema.schema(_, _))
        required(:workshop).maybe(:hash, EndUser::ShortWorkshopSchema.schema(_, _))
      end
    end
  end
end
# rubocop:enable Lint/UnderscorePrefixedVariableName
