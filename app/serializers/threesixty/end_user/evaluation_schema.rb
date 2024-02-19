# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName

module Threesixty
  module EndUser
    class EvaluationSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:is_self).filled(:bool?)
          required(:evaluator_id).filled(:int?)
          required(:campaign_id).filled(:int?)
          required(:evaluator_nomination_status).filled(:str?)
          required(:status).filled(:str?)
          required(:subject_evaluation_closed).filled(:bool?)
          optional(:assessment_extra).hash do
            optional(:timer).maybe(:int?)
            optional(:icon_color).maybe(:str?)
            optional(:enable_video_check).maybe(:bool?)
            optional(:enable_audio_check).maybe(:bool?)
            optional(:enable_network_check).maybe(:bool?)
          end
          required(:assessment_id).filled(:int?)
          required(:user).hash(UserSchema.schema(_, _))
          required(:subject).hash(UserSchema.schema(_, _))
        end
      end
    end
  end
end

# rubocop:enable Lint/UnderscorePrefixedVariableName
