# frozen_string_literal: true

module Reports
  module ResultTypes
    class ZscoreToPercentile < BaseType
      def call
        source = data['source']
        round = data['round'] || 3
        result = ::Reports::BuildResults::CLASS_MAP[source['type'].to_sym].
                 constantize.call(context, source).try(:[], :value)
        {
          key: data['id'],
          name: data['label'],
          config_data: data,
          value: calculate(result, round)
        }
      end

      private

      def calculate(zscore, round)
        Ztable.percentile(zscore).round(round) if zscore
      end
    end
  end
end
