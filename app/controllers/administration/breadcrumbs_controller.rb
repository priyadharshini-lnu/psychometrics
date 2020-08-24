# frozen_string_literal: true

module Administration
  class BreadcrumbsController < Administration::BaseController
    skip_after_action :verify_policy_scoped
    before_action :pundit_authorize, except: %i[index]

    def index
      object =
        params[:fields].each_with_object({}) do |field, hash|
          hash[field] = send(field)
        end

      render json: BreadcrumbSerializer.new(object, fields: params[:fields]).to_h
    end

    def campaign
      @campaign ||= Campaign.find_by(id: params[:data][:campaign_id])
    end

    def project
      @project ||= params[:data][:project_id] ? Client.find_by(id: params[:data][:project_id]) : campaign.project
    end

    def client
      @client ||= params[:data][:client_id] ? Client.find_by(id: params[:data][:client_id]) : project.client
    end
  end
end
