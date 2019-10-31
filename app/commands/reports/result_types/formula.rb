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
        results = formula_args.map do |arg|
          BuildResults::CLASS_MAP[arg['type'].to_sym].constantize.call(context, arg).try(:[], :value)
        end.flatten.compact
        {
          key: data['key'] || 'formula',
          name: data['label'],
          config_data: data,
          value: calc(results, formula_op)
        }
      end

      def formula_args
        data.dig('formula', 'args') || []
      end

      def calc(results, formula_op)
        return if results.blank?

        return (results.inject(0.0, :+) / results.size.to_f).round(2) if formula_op == AVERAGE
        return results.min if formula_op == MIN
        return results.max if formula_op == MAX
        return results.inject(&:+) if formula_op == ADD
        return results.inject(&:-) if formula_op == SUBTRACT
        return results.inject(&:/) if formula_op == DIVIDE
        return results.inject(&:*) if formula_op == MULTIPLY

        raise "Formula operation #{formula_op} is not supported"
      end
    end
  end
end
