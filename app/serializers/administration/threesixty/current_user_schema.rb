# frozen_string_literal: true

# rubocop:disable Metrics/AbcSize
# rubocop:disable Metrics/BlockLength

module Administration
  module Threesixty
    class CurrentUserSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:is_manager).filled(:bool?)
          required(:email).filled(:str?)
          required(:first_name).filled(:str?)
          required(:last_name).filled(:str?)
          required(:full_name).maybe(:str?)
          required(:role).filled(:str?)
          required(:is_anonym).filled(:bool?)
          required(:permissions).hash do
            required(:editParticipantOptions).filled(:bool?)
            required(:editReportOptions).filled(:bool?)
            required(:accessEmailMessages).filled(:bool?)
            required(:accessInstructionMessages).filled(:bool?)
            required(:accessMessagesOptions).filled(:bool?)
            required(:editAssessment).filled(:bool?)
            required(:editReport).filled(:bool?)
            required(:editDimension).filled(:bool?)
            required(:manageRelationships).filled(:bool?)
            required(:regenerateReport).filled(:bool?)
            required(:manageAdmins).filled(:bool?)
            required(:manageFactorBenchmarkScores).filled(:bool?)
            required(:viewFactorBenchmarkScores).filled(:bool?)
          end
          optional(:photo)
          required(:timezone).maybe(:str?)
          required(:last_sign_in_at).filled(:str?)
          required(:role_title).filled(:str?)
          required(:name).maybe(:str?)
        end
      end
    end
  end
end
# rubocop:enable Metrics/AbcSize
# rubocop:enable Metrics/BlockLength
