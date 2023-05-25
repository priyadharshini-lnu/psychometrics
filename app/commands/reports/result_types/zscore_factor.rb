# frozen_string_literal: true

module Reports
  module ResultTypes
    class ZscoreFactor < BaseType
      def call
        user_result = context.find_user_result_by(data['assessmentId'])
        factor_name = context.resources.dig(:factor_names, data['factorId'])
        raise ActiveRecord::RecordNotFound unless factor_name

        return decorate(factor_name) unless user_result&.assessment_id == data['assessmentId']

        decorate(factor_name, user_result.scoring&.dig(data['factorId']&.to_s, 'zscore'))
      rescue ActiveRecord::RecordNotFound => e
        Rails.logger.warn e.message
        decorate(factor_name)
      end

      def decorate(factor_name, result = nil)
        {
          key: data['factorId'],
          name: data['label'] || factor_name,
          config_data: data,
          value: result
        }
      end
    end
  end
end
