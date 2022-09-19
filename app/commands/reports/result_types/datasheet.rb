# frozen_string_literal: true

module Reports
  module ResultTypes
    class Datasheet < BaseType
      def call
        {
          key: data['id'],
          name: data['label'] || data['key'],
          value: context.datasheet_value(data['key']),
          config_data: data
        }
      end
    end
  end
end
