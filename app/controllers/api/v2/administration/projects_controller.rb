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

    def fetch_campaign_dashboard_instructions
      list = request_locales.map do |locale|
        Mobility.with_locale(locale) do
          { locale: locale, campaignDashboardInstructions: dashboard_project.campaign_dashboard_instructions }
        end
      end

      available_locales = dashboard_project.translations.pluck(:locale).uniq

      render json: { list: list, availableLocales: available_locales }
    end

    def update_campaign_dashboard_instructions
      locale = request_attributes[:locale] || I18n.default_locale.to_s
      instructions = request_attributes[:campaign_dashboard_instructions]

      Mobility.with_locale(locale) do
        dashboard_project.update!(campaign_dashboard_instructions: instructions)
      end

      audit! :update_campaign_dashboard_instructions, dashboard_project, payload: params
      render json: { campaignDashboardInstructions: instructions, locale: locale }
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors.messages }, status: :unprocessable_content
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

    def dashboard_project
      @dashboard_project ||= Project.find(params[:id])
    end

    def request_attributes
      params.dig(:data, :attributes) || params
    end

    def request_locales
      Array(request_attributes[:locales]).presence || [I18n.default_locale.to_s]
    end

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
