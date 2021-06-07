# frozen_string_literal: true

module Reports
  module ResultTypes
    class NormedFactor < BaseType
      def call
        assign = context.find_assign_by(data['assessmentId'])
        # Skip if can't find factor
        factor = nil
        factor_alias = nil
        factor = Factor.find(data['factorId'])
        factor_alias = factor.aliases.find_by(report_id: context.report.id)
        # Skip if the assign is for another assessment

        return decorate(factor, factor_alias) unless assign&.assessment_id == data['assessmentId']

        decorate(factor, factor_alias, assign.scoring&.dig(data['factorId']&.to_s, 'norm_score'))
      rescue ActiveRecord::RecordNotFound => e
        Rails.logger.warn e.message
        decorate(factor, factor_alias)
      end

      def decorate(factor, factor_alias, result = nil)
        {
          key: data['factorId'],
          name: data['label'] || factor_alias&.name || factor&.name,
          config_data: data,
          value: result
        }
      end
    end
  end
end
