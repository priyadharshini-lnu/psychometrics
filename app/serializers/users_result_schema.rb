# frozen_string_literal: true

# rubocop:disable Metrics/AbcSize
# rubocop:disable Metrics/BlockLength
# rubocop:disable Lint/UnderscorePrefixedVariableName
class UsersResultSchema < BaseSchema
  def self.schema(_, _)
    Dry::Schema.JSON do
      config.validate_keys = false

      required(:id).filled(:int?)
      required(:status).filled(:str?)
      required(:step).filled(:int?)
      required(:answers).value { hash? | array? | nil? }
      required(:results).value { hash? | array? | nil? }
      optional(:end_date) { str? | time? }
      optional(:scoring).maybe(:hash?)
      required(:user_id).maybe(:int?)
      required(:assessment_id).maybe(:int?)
      optional(:data_sheet).maybe(:hash?)
      required(:relationship).maybe(:str?)
      required(:norm_id).maybe(:int?)
      required(:embedded_data).maybe(:hash?)
      optional(:is_self).maybe(:bool?)
      required(:as_manager).maybe(:bool)
      required(:campaign_id).maybe(:int?)
      required(:available_translations).filled(:array?)
      optional(:translations).maybe(:hash?)
      optional(:selected_locale).maybe(:hash?)
      required(:current_element).maybe(:str?)
      required(:current_page).maybe(:int?)
      required(:seedrandom).filled(:str?)
      optional(:subject_datasheet).maybe(:hash?)
      optional(:highlights).maybe(:array?)
      required(:user_assessment_id).filled(:int?)
      required(:started_at).maybe(:str?)
      optional(:prev_pages).maybe(:array?)
      optional(:timed_out).maybe(:bool?)
      optional(:completed_at).maybe(:str?)
      optional(:factors).maybe(:array?)
      required(:remaining_campaign_time).value { int? | float? | nil? }
      required(:remaining_assessment_time).value { int? | float? | nil? }
      required(:reset_count).maybe(:int?)
      required(:hash_id).maybe(:str?)
      required(:proctoring_enabled).maybe(:bool?)
      required(:privacy_consent_required).maybe(:bool?)
      optional(:other_pending_assessments_count).maybe(:int?)
      required(:prework).maybe(:bool?)
      required(:user).hash(UserSchema.schema(_, _))
      required(:subject).hash(UserSchema.schema(_, _))
      required(:participant).hash(Threesixty::EndUser::ParticipantSchema.schema(_, _))
      required(:media_responses).array(MediaResponseSchema.schema(_, _))
      required(:campaign_user).maybe(:hash) do
        EndUser::CampaignUserSchema.schema(_, _)
      end
      required(:campaign_options).hash(EndUser::CampaignOptionsSchema.schema(_, _))
    end
  end
end
# rubocop:enable Lint/UnderscorePrefixedVariableName
# rubocop:enable Metrics/BlockLength
# rubocop:enable Metrics/AbcSize
