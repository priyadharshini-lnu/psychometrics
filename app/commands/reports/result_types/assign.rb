# frozen_string_literal: true

module Reports
  module ResultTypes
    class Assign < BaseType
      COLUMNS = %w[started_at completed_at selected_locale status].freeze
      def call
        assign = context.find_assign_by(data['assessmentId'])
        decorate(assign)
      end

      private

      def decorate(assign)
        {
          key: data['key'],
          name: data.try('label') || data['key'].humanize,
          config_data: data,
          value: (assign&.decorate&.try(data['key']) if COLUMNS.include?(data['key']))
        }
      end
    end
  end
end
