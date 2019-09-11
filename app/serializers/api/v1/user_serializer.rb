# frozen_string_literal: true

module Api
  module V1
    class UserSerializer < ActiveModel::Serializer
      attributes :id, :first_name, :last_name, :email, :created_at, :updated_at, :campaign_ids

      def campaign_ids
        # Pay attention on possibility N+1 queries. This serializer can not be used for array of users
        project_campaign_ids = Client.campaigns_and_sub_campaigns_of(instance_options[:project].id).ids
        object.memberships.where(client_id: project_campaign_ids).map(&:client_id)
      end
    end
  end
end
