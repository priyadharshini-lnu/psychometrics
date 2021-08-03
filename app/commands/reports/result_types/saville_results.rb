# frozen_string_literal: true

module Reports
  module ResultTypes
    class SavilleResults < BaseType
      def call
        user_result = context.find_user_result_by(data['assessmentId'])
        if user_result
          value = (user_result.external_results['scores'] || []).find do |score|
            score['id'] == data['factorId'] && score['score_type'] == data['scoreType'] &&
              score['value_type'] == data['valueType']
          end&.dig('score')
        end
        {
          key: "#{data['factorId']}.#{data['scoreType']}.#{data['valueType']}",
          name: data['label'],
          config_data: data,
          value: value
        }
      end
    end
  end
end
