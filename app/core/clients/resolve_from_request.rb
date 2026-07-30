# frozen_string_literal: true

module Clients
  class ResolveFromRequest < BaseCommand
    private_attr_reader :path, :params

    def initialize(path, params)
      @path = path.to_s
      @params = params || {}
    end

    def call
      broadcast :ok, client_from_path || client_from_filter || client_from_params
    end

    private

    def client_from_path
      case path
        when %r{/clients/(\d+)}
          Client.find_by(id: Regexp.last_match(1))
        when %r{/(?:projects|new_projects)/(\d+)}
          Project.find_by(id: Regexp.last_match(1))&.client
        when %r{/(?:campaigns|new_campaigns|threesixty_campaigns)/(\d+)}
          Campaign.find_by(id: Regexp.last_match(1))&.client
      end
    end

    def client_from_filter
      filter = params[:filter]
      return if filter.blank?

      if (client_id = filter[:client_id_eq] || filter[:owner_id_eq]).present?
        Client.find_by(id: client_id)
      elsif filter[:project_id_eq].present?
        Project.find_by(id: filter[:project_id_eq])&.client
      elsif filter[:campaign_id_eq].present?
        Campaign.find_by(id: filter[:campaign_id_eq])&.client
      end
    end

    def client_from_params
      if params[:client_id].present?
        Client.find_by(id: params[:client_id])
      elsif params[:project_id].present?
        Project.find_by(id: params[:project_id])&.client
      elsif params[:campaign_id].present?
        Campaign.find_by(id: params[:campaign_id])&.client
      end
    end
  end
end
