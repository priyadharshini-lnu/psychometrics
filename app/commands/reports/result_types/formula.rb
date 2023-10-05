# frozen_string_literal: true

module Reports
  module ResultTypes
    class Formula < BaseType
      AVERAGE = 'AVERAGE'
      MIN = 'MIN'
      MAX = 'MAX'
      ADD = 'ADD'
      DIVIDE = 'DIVIDE'
      SUBTRACT = 'SUBTRACT'
      MULTIPLY = 'MULTIPLY'

      def call
        formula_op = data.dig('formula', 'op')
        round = data.dig('formula', 'round')
        total_weight = 0
        results = formula_args.map do |arg|
          weight = arg['weight'] || 1
          score = Reports::BuildResults::CLASS_MAP[arg['type'].to_sym].constantize.call(context, arg).try(:[], :value)
          if score.present?
            score *= weight
            total_weight += weight
          end
          score
        end.flatten
        {
          key: data['id'] || 'formula',
          name: data['label'],
          config_data: data,
          value: calc(results, formula_op, total_weight)&.round(round || 2)
        }
      end

      def formula_args
        data.dig('formula', 'args') || []
      end

      def calc(results, formula_op, total_weight) # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
        return if results.blank?
        return if results.any?(&:nil?)

        return (results.sum(0.0) / total_weight.to_f) if formula_op == AVERAGE
        return results.min if formula_op == MIN
        return results.max if formula_op == MAX
        return results.sum if formula_op == ADD
        return results.inject(&:-) if formula_op == SUBTRACT
        return results.inject(&:/) if formula_op == DIVIDE
        return results.inject(&:*) if formula_op == MULTIPLY

        raise "Formula operation #{formula_op} is not supported"
      end
    end
  end
end
