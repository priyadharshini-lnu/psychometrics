# frozen_string_literal: true

module Reports
  module ResultTypes
    class ExternalResults < BaseType
      def call
        user_result = context.find_user_result_by(data['assessmentId'])
        if user_result&.assessment_id == data['assessmentId']
          value = user_result.external_results.try(:[], data['key'])
        end
        {
          key: data['key'],
          name: data['label'],
          config_data: data,
          value: value
        }
      end
    end
  end
end
