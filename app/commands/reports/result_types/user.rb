# frozen_string_literal: true

module Reports
  module ResultTypes
    class User < BaseType
      ALLOWED_FIELDS = %w[id first_name last_name email locale].freeze
      def call
        {
          key: data['key'],
          name: data['label'],
          config_data: data,
          value: user_data
        }
      end

      def user_data
        return nil unless ALLOWED_FIELDS.include?(data['key'])
        return nil if context.users_results.empty?

        context.users_results.first.subject.try(data['key'])
      end
    end
  end
end
