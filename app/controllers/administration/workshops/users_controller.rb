# frozen_string_literal: true

module Administration
  module Workshops
    class UsersController < Administration::BaseController
      skip_before_action :enforce_geo_restriction
      before_action :set_resource, only: %i[search_subjects search_assessors]
      append_before_action :pundit_authorize

      def search_subjects
        @workshop.campaign.client.check_geo_restriction!
        ids = @workshop.workshop_subjects.pluck(:user_id)
        users = Panko::ArraySerializer.new(
          ::User.where(id: ids).search_query(params[:q]),
          each_serializer: ::Projects::SearchUserSerializer
        ).to_a
        render json: users
      end

      def search_assessors
        @workshop.campaign.client.check_geo_restriction!
        ids = @workshop.workshop_assessors.pluck(:user_id)
        users = Panko::ArraySerializer.new(
          ::Users::Admin.where(id: ids).search_query(params[:q]),
          each_serializer: ::Projects::SearchUserSerializer
        ).to_a
        render json: users
      end

      def set_resource
        @workshop = Workshop.find(params[:workshop_id])
      end

      def pundit_authorize
        authorize(
          User,
          nil,
          project_id: @workshop.campaign.project_id,
          campaign_id: @workshop.campaign_id,
          policy_class: Administration::Workshops::UserPolicy
        )
      end
    end
  end
end
