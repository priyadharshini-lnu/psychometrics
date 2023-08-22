# frozen_string_literal: true

module Administration
  module Workshops
    class UsersController < Administration::BaseController
      before_action :set_resource, only: %i[search_subjects search_assessors]
      append_before_action :pundit_authorize

      def search_subjects
        ids = @workshop.workshop_subjects.pluck(:user_id)
        users = ::User.where(id: ids).search_query(params[:q]).map do |user|
          ::Projects::SearchUserSerializer.new(user).to_h
        end
        render json: users
      end

      def search_assessors
        ids = @workshop.workshop_assessors.pluck(:user_id)
        users = ::Users::Admin.where(id: ids).search_query(params[:q]).map do |user|
          ::Projects::SearchUserSerializer.new(user).to_h
        end
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
