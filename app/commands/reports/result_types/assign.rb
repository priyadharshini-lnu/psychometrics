# frozen_string_literal: true

module Reports
  module ResultTypes
    class Assign < BaseType
      COLUMNS = %w[started_at completed_at selected_locale status].freeze
      def call
        user_result = context.find_user_result_by(data['assessmentId'])
        decorate(user_result)
      end

      private

      def decorate(user_result)
        {
          key: data['key'],
          name: data.try('label') || data['key'].humanize,
          config_data: data,
          value: (user_result&.decorate&.try(data['key']) if COLUMNS.include?(data['key']))
        }
      end
    end
  end
end
