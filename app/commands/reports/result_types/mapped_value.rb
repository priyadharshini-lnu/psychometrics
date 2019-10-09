# frozen_string_literal: true

module Reports
  module ResultTypes
    class MappedValue < BaseType
      def call
        source = data.dig('source')
        result = BuildResults::CLASS_MAP[source['type'].to_sym].constantize.call(context, source).try(:[], :value)
        {
          key: 'mapped_value',
          name: data['label'],
          config_data: data,
          value: calculate(result)
        }
      end

      private

      def calculate(compared_value)
        rules = data.dig('rules')
        rules.each do |rule|
          return rule['result'] if rule.dig('conditions').all? do |condition|
            EvaluateCondition.call(condition['type'], [compared_value, condition['value']])[:ok]
          end
        end

        nil
      end
    end
  end
end
