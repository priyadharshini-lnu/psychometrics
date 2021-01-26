# frozen_string_literal: true

module Administration
  module Campaigns
    class UserSerializer < ActiveModel::Serializer
      attributes :id, :first_name, :last_name, :email, :full_name, :created_by, :updated_by,
                 :created_at, :updated_at, :locale

      attribute :active do
        campaign_user&.active
      end

      attribute :started_at do
        campaign_user&.started_at && I18n.l(campaign_user&.started_at, format: :short)
      end

      attribute :completed_at do
        campaign_user&.completed_at && I18n.l(campaign_user&.completed_at, format: :short)
      end

      attribute :completed_via do
        campaign_user&.completed_via
      end

      attribute :completion_status do
        campaign_user&.completion_status
      end

      attribute :additional_time do
        campaign_user&.additional_time
      end

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

      def full_name
        object.decorate.full_name
      end

      def campaign_user
        object.campaign_users.find { |cu| cu.campaign_id == @instance_options[:campaign_id] }
      end
    end
  end
end
