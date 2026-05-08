# frozen_string_literal: true

module Api
  class V2::Administration::ProjectsController < Api::V2::Administration::BaseController
    validates_request_schema :update, -> { Api::V2::Projects::UpdateContract.new }
    validates_request_schema :create, -> { Api::V2::Projects::CreateContract.new }
    validates_request_schema :add_manager, -> { Api::V2::Projects::AddManagerContract.new }

    validate_crud_requests Api::V2::Projects::Schema

    def workshop_status_export
      AdminJob.call(
        :workshop_status_export,
        { project_id: project_id, include_inactive_users: include_inactive_users },
        current_user
      )

      render json: :ok
    end

    def export_completion_status
      AdminJob.call(
        :project_completion_status_export,
        { project_id: project_id, include_inactive_users: include_inactive_users },
        current_user
      )

      render json: :ok
    end

    def export_compact_completion_status
      AdminJob.call(
        :project_compact_completion_status_export,
        { project_id: project_id, include_inactive_users: include_inactive_users },
        current_user
      )

      render json: :ok
    end

    def seach_user
      campaign_id = params[:filter][:campaign_id]
      users = User.where(project_id: project_id).filterable_fields(params[:filter][:search_query])
      users = users.joins(:campaigns).where(campaigns: { id: campaign_id }) if campaign_id

      users = users.where.not(id: params[:filter][:exclude_user_id]) if params.dig(:filter, :exclude_user_id)

      jsonapi_render json: users.to_a, options: { resource: Api::V2::Administration::UserResource }
    end

    def add_manager
      user = User.find_by(id: params[:user_id], project_id: project_id)

      if user.update(manager_id: params[:manager_id])
        audit! :add_manager, user, payload: params
        if user.manager.present?
          jsonapi_render json: user.manager, options: { resource: V2::Administration::ManagerResource }
        else
          head :no_content
        end
      else
        jsonapi_render_errors user.errors
      end
    end

    def context
      super.merge(
        client: client
      )
    end

    def project_id
      params[:id]
    end

    private

    def include_inactive_users
      params[:include_inactive_users]&.to_s == 'true' || params.dig(:data, :attributes, :include_inactive_users)
    end

    def client
      client_id = params[:client_id] || Project.find_by(id: params[:id])&.ancestry

      return nil unless client_id

      @client ||= Api::Administration::ProjectPolicy::Scope.new(
        current_user, Client
      ).resolve.find(client_id)
    end
  end
end
