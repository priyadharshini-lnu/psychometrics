# frozen_string_literal: true

module Reports
  module ResultTypes
    class User < BaseType
      def call
        {
          key: data['key'],
          name: data['label'],
          config_data: data,
          value: context.users_results.first.subject.try(data['key'])
        }
      end
    end
  end
end
