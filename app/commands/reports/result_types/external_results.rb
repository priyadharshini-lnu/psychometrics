# frozen_string_literal: true

module Reports
  module ResultTypes
    class ExternalResults < BaseType
      def call
        assign = context.find_assign_by(data['assessmentId'])
        {
          key: data['key'],
          name: data['label'],
          config_data: data,
          value: assign&.assessment_id == data['assessmentId'] ? assign.external_results.try(:[], data['key']) : nil
        }
      end
    end
  end
end
