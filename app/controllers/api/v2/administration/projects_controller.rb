# frozen_string_literal: true

module Api
  class V2::Administration::ProjectsController < Api::V2::Administration::BaseController
    validates_request_schema :update, Api::V2::Projects::UpdateContract.new
    validates_request_schema :create, Api::V2::Projects::CreateContract.new

    validate_crud_requests Api::V2::Projects::Schema

    def context
      super.merge(
        client: client
      )
    end

    def project_id
      params[:id]
    end

    private

    def client
      client_id = params[:client_id] || Project.find_by(id: params[:id]).ancestry

      @client ||= Api::Administration::ProjectPolicy::Scope.new(
        current_user, Client
      ).resolve.find(client_id)
    end
  end
end
