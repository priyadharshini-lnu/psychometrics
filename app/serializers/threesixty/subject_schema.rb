# frozen_string_literal: true

# rubocop:disable Metrics/AbcSize
# rubocop:disable Lint/UnderscorePrefixedVariableName
# rubocop:disable Metrics/BlockLength

module Threesixty
  class SubjectSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = false

        required(:id).filled(:int?)
        required(:status).filled(:str?)
        required(:user_report_id).filled(:int?)
        required(:report_status).filled(:str?)
        required(:evaluators).filled(:str?)
        required(:evaluations).filled(:str?)
        required(:permissions).hash do
          optional(:login).filled(:bool?)
          optional(:spoof).filled(:bool?)
          required(:edit_user).filled(:bool?)
          required(:view_report).filled(:bool?)
          required(:download_report).filled(:bool?)
          required(:view_responses).filled(:bool?)
          required(:approve_report).filled(:bool?)
          required(:remove_report_approval).filled(:bool?)
          required(:release_report).filled(:bool?)
          required(:hold_report).filled(:bool?)
          required(:remove_report_hold_release).filled(:bool?)
          required(:mark_as_done).filled(:bool?)
          required(:unmark_as_done).filled(:bool?)
          required(:remove_subject).filled(:bool?)
          required(:remove_from_campaign).filled(:bool?)
          required(:regenerate_report).filled(:bool?)
          required(:reset_password).filled(:bool?)
        end
        required(:report_download_url).maybe(:hash?)
        required(:user).hash(UserSchema.schema(_, _))
      end
    end
  end
end

# rubocop:enable Metrics/AbcSize
# rubocop:enable Lint/UnderscorePrefixedVariableName
# rubocop:enable Metrics/BlockLength
