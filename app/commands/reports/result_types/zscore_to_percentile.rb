# frozen_string_literal: true

module Reports
  module ResultTypes
    class ZscoreToPercentile < BaseType
      def call
        source = data['source']
        result = ::Reports::BuildResults::CLASS_MAP[source['type'].to_sym].
                 constantize.call(context, source).try(:[], :value)
        {
          key: data['id'],
          name: data['label'],
          config_data: data,
          value: calculate(result)
        }
      end

      private

      def calculate(zscore)
        Ztable.percentile(zscore) if zscore
      end
    end
  end
end
