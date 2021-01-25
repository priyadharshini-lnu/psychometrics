# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessorSerializer < ActiveModel::Serializer
      attributes :id, :full_name, :email,
                 :status, :total_evaluations, :completed_evaluations

      delegate :email, to: :user

      def full_name
        user.decorate.full_name
      end

      def status
        return :completed if total_evaluations == completed_evaluations

        :not_completed
      end

      def total_evaluations
        evalutions_count[:total]
      end

      def completed_evaluations
        evalutions_count[:completed]
      end

      private

      def evalutions_count
        instance_options[:evalutions_count][object.user_id] || { total: 0, completed: 0 }
      end

      def user
        object.user
      end
    end
  end
end
