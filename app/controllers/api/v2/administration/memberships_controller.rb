# frozen_string_literal: true

module Api
  class V2::Administration::MembershipsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::Membership::Schema

    before_action :set_resource, only: %i[spoof reset_password]

    def reset_password
      @_resource.user.send_reset_password_instructions
      render json: :ok
    end

    def spoof
      sign_in(@_resource.user)
      redirect_url ||= administration_root_path
      flash.now[:success] = I18n.t('administration.administrators.list.actions.spoof.login_successful')
      redirect_to redirect_url
    end

    def context
      super.merge(
        project_id: params.dig(:filter, :client_id_eq),
        campaign_id: params.dig(:filter, :campaign_id_eq),
        current_user: current_user
      )
    end

    private

    def set_resource
      @_resource = Api::Administration::Projects::AdminPolicy::Scope.new(
        current_user, Membership
      ).resolve.find(params[:admin_id])
    end

    def base_response_meta
      return {} if params[:action] != 'index'

      {
        permissions: GetPermissionsHash.call!(
          Api::Administration::MembershipPolicy,
          context[:user],
          @model,
          [
            %w[login_as spoof],
            'edit',
            %w[remove destroy],
            'reset_password',
            'send_mail'
          ],
          {
            project_id: context[:project_id],
            campaign_id: context[:campaign_id]
          }
        ),
        users_all_permissions: GetUserGrants.call!(
          context[:user], context[:project_id]
        )
      }
    end
  end
end
