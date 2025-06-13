# frozen_string_literal: true

module Api
  class V2::Administration::MembershipsController < Api::V2::Administration::BaseController
    validates_request_schema :create, -> { Api::V2::Membership::CreateContract.new }
    validate_crud_requests Api::V2::Membership::Schema

    before_action :set_resource, only: %i[spoof reset_password]

    def available_permissions
      render json: AllowedPermissions::PERMISSION_BY_ADMIN_TYPE[params[:role]]
    end

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

    def export
      AdminJob.call(:export_admin_with_permissions, export_job_data, current_user)
      audit! :export, nil, payload: export_job_data, record_type: Membership

      render json: :ok
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

    def export_job_data
      case params.dig(:filter, :with_role)
        when 'campaign_admin'
          { campaign_id: Campaign.find(export_params[:campaign_id]).id }
        when 'project_admin'
          { project_id: Project.find(export_params[:project_id]).id }
        else
          { client_id: Client.find(export_params[:client_id]).id }
      end
    end

    def export_params
      params.require(:data).require(:attributes).permit(:client_id, :project_id, :campaign_id)
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
            'send_mail',
            'export'
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
