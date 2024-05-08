# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Threesixty
  module EndUser
    class CampaignSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = false

          required(:id).filled(:int?)
          required(:type).maybe(:str?)
          required(:reports).filled(:hash?)
          required(:assessment_name).filled(:str?)
          required(:instructions).filled(:array?)
          required(:evaluations_counters).filled(:hash?)
          required(:nominations_counters).filled(:hash?)
          required(:reports_counters).filled(:hash?)
          required(:nominations).array(Threesixty::EndUser::CampaignNomineeSchema.schema(_, _))
          required(:managed_subjects).array(Threesixty::EndUser::ManagedSubjectSchema.schema(_, _))
          required(:is_subject).filled(:bool?)
          required(:status).filled(:str?)
          required(:evaluations).array(Threesixty::EndUser::EvaluationSchema.schema(_, _))
          required(:reports).array(Threesixty::UserReportSchema.schema(_, _))
          required(:options).hash(Threesixty::CampaignOptionsSchema.schema(_, _))
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
