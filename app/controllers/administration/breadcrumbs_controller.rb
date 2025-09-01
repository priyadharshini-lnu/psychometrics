# frozen_string_literal: true

module Administration
  class BreadcrumbsController < Administration::BaseController
    skip_before_action :enforce_geo_restriction
    skip_after_action :verify_policy_scoped
    before_action :pundit_authorize, except: %i[index]
    skip_before_action :init_state

    def index
      object = params[:fields].index_with { |field| send(field) }
      render json: BreadcrumbSerializer.new(
        only: params[:fields].map(&:to_sym),
        context: {
          fields: params[:fields]
        }
      ).serialize(object)
    end

    def campaign
      @campaign ||= Campaign.find_by(id: params[:data][:campaign_id])
    end

    def threesixty
      @threesixty ||= ::Threesixty::Campaign.find_by(id: params[:data][:threesixty_id])
    end

    def project
      @project ||= params[:data][:project_id] ? Client.find_by(id: params[:data][:project_id]) : campaign.project
    end

    def client
      @client ||= params[:data][:client_id] ? Client.find_by(id: params[:data][:client_id]) : project.client
    end
  end
end
