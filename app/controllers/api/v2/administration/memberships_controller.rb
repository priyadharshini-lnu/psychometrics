# frozen_string_literal: true

module Api
  class V2::Administration::MembershipsController < Api::V2::Administration::BaseController
    validates_request_schema :create, Api::V2::Membership::CreateContract.new
    validate_crud_requests Api::V2::Membership::Schema

    before_action :set_resource, only: %i[spoof reset_password]

    def spoof
      sign_in(@_resource.user)
      redirect_url ||= admin_path
      flash.now[:success] = I18n.t('administration.administrators.list.actions.spoof.login_successful')
      redirect_to redirect_url
    end

    def context
      super.merge(
        project_id: project_id,
        campaign_id: campaign_id,
        current_user: current_user
      )
    end

    def project_id
      params.dig(:filter, :project_id_eq) || params.dig(:filter, :client_id_eq)
    end

    def campaign_id
      params.dig(:filter, :campaign_id_eq)
    end

    private

    def set_resource
      @_resource = Api::Administration::MembershipPolicy::Scope.new(
        current_user, Membership
      ).resolve.find(params[:membership_id])
    end

    def policy_class
      @policy_class ||= case params.dig(:filter, :with_role)
                          when 'project_admin'
                            Api::Administration::ProjectMembershipPolicy
                          when 'campaign_admin'
                            Api::Administration::CampaignMembershipPolicy
                          else
                            super
                        end
    end

    def base_response_meta
      return {} if params[:action] != 'index'

      {
        permissions: GetPermissionsHash.call!(
          policy_class,
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
        users_grants: GetUserGrants.call!(
          context[:user], context[:project_id]
        )
      }
    end
  end
end
