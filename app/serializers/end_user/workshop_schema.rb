# frozen_string_literal: true

# rubocop:disable Lint/UnderscorePrefixedVariableName
module EndUser
  class WorkshopSchema < BaseSchema
    def self.schema(_, _)
      Dry::Schema.JSON do
        config.validate_keys = true

        required(:id).maybe(:int?)
        required(:start_time).maybe(:str?)
        required(:duration).maybe(:int?)
        required(:completion_status).maybe(:int?)
        required(:attendance_status).maybe(:str?)
        required(:meeting_link).maybe(:str?)
        required(:attended).maybe(:bool?)
        required(:activities).maybe do
          array(::EndUser::UserAssessmentSchema.schema(_, _))
        end
        required(:preworks).maybe do
          array(::EndUser::UserAssessmentSchema.schema(_, _))
        end
      end
    end
  end
end
# rubocop:enable Lint/UnderscorePrefixedVariableName
