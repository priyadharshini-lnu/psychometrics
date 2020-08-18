# frozen_string_literal: true

module Administration
  module Campaigns
    class UserSerializer < ActiveModel::Serializer
      attributes :id, :first_name, :last_name, :email, :created_by, :created_at, :updated_by, :updated_at,
                 :active, :completion_status

      def created_at
        I18n.l object.created_at, format: :short
      end

      def created_by
        object.creator&.email
      end

      def updated_at
        I18n.l object.updated_at, format: :short
      end

      def updated_by
        object.modifier&.email
      end

      def completion_status
        return 'not_started' if object.user_assessments.empty?
        return 'not_started' if object.user_assessments.all? { |a| !a.users_result || a.users_result.not_started? }
        return 'completed' if object.user_assessments.all? { |a| a.users_result&.completed? }

        'in_progress'
      end

      def active
        object.campaign_users.find { |cu| cu.campaign_id == @instance_options[:campaign_id] }&.active
      end
    end
  end
end
