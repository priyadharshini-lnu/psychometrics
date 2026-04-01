# frozen_string_literal: true

module Administration
  class BreadcrumbsController < Administration::BaseController
    ALLOWED_FIELDS = %w[campaign threesixty project client].freeze

    skip_before_action :enforce_geo_restriction
    skip_after_action :verify_policy_scoped
    before_action :pundit_authorize, except: %i[index]
    skip_before_action :init_state

    def index
      request_fields = Array(params[:fields])
      object = request_fields.index_with do |field|
        sanitized_field = sanitize_field(field)
        send(sanitized_field) if sanitized_field
      end
      render json: BreadcrumbSerializer.new(
        only: fields.map(&:to_sym),
        context: {
          fields: fields
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

    private

    def sanitize_field(request_field)
      return nil unless ALLOWED_FIELDS.include?(request_field)

      request_field
    end
  end
end
