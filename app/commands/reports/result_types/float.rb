# frozen_string_literal: true

module Reports
  module ResultTypes
    class Float < BaseType
      def call
        {
          key: data['id'],
          name: data['label'],
          config_data: data,
          value: data['value']
        }
      end
    end
  end
end
