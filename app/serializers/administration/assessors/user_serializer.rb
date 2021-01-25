# frozen_string_literal: true

module Administration
  module Assessors
    class UserSerializer < ActiveModel::Serializer
      attributes :id, :email, :full_name, :total_evaluations, :completed_evaluations, :completion_status

      def full_name
        object.decorate.full_name
      end

      def completion_status
        ::Assessors::GetStatusFromCounts.call!(evaluation_count)
      end

      def total_evaluations
        evaluation_count[:total]
      end

      def completed_evaluations
        evaluation_count[:completed]
      end

      private

      def evaluation_count
        instance_options.dig(:evaluations_count, object.id) || { total: 0, completed: 0, in_progress: 0 }
      end
    end
  end
end
