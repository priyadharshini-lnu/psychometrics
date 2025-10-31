# frozen_string_literal: true

module Memberships
  class PermittedAdminParams < BaseCommand
    private_attr_reader :params_for, :user, :resource

    USER_PARAMETERS = %i[first_name last_name email].freeze
    UPDATE_USER_PARAMETERS = [:id, USER_PARAMETERS].flatten.freeze
    GRANT_PARAMETERS = [data: [
      users: [],
      clients: [],
      projects: [],
      campaigns: [],
      dimensions: [],
      reports: [],
      assessments: [],
      communications: [],
      results: [],
      assessors: [],
      registration_codes: [],
      datasheets: [],
      sms_invites: [],
      messages: []
    ]].freeze

    def initialize(params_for, user, resource)
      @params_for = params_for
      @user = user
      @resource = resource
    end

    def call
      allowed_params = permitted_attributes_for_create if params_for == 'create'
      allowed_params = permitted_attributes_for_update if params_for == 'update'

      broadcast :ok, allowed_params
    end

    def permitted_attributes_for_create
      [user_attributes: USER_PARAMETERS, grants_attributes: GRANT_PARAMETERS]
    end

    def permitted_attributes_for_update
      if @user.is?(:superadmin, :client_admin, :project_admin) && @resource.user.is?(:campaign_admin)
        [
          user_attributes: UPDATE_USER_PARAMETERS,
          grants_attributes: GRANT_PARAMETERS
        ]
      else
        [
          user_attributes: UPDATE_USER_PARAMETERS
        ]
      end
    end
  end
end
