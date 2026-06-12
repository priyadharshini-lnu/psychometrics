# frozen_string_literal: true

module Api
  class V2::Administration::MembershipsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction, except: %i[index]
    before_action :check_geo_restriction_if_client_context, only: %i[create update]
    validates_request_schema :create, -> { Api::V2::Membership::CreateContract.new }
    validate_crud_requests Api::V2::Membership::Schema

    before_action :set_resource, only: %i[spoof reset_password]

    def available_permissions
      render json: AllowedPermissions::PERMISSION_BY_ADMIN_TYPE[params[:role]]
    end

    def spoof
      target_user = @_resource.user
      client = @_resource.client.root

      role_name = @_resource.role.to_s.humanize.titleize
      audit! :sign_in_as, target_user, payload: { sign_in_as: target_user.email }, client: client
      siem_log_impersonation_event(target_user, role_name)
      redirect_via_handoff(target_user, client, impersonated_by: current_user)
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

    def authorize_spoof
      set_resource unless @_resource
      policy_klass = policy_class_for_role(@_resource.role)
      authorize @_resource, :spoof?, policy_class: policy_klass,
               project_id: @_resource.client_id, campaign_id: @_resource.campaign_id
    end

    def enforce_geo_restriction
      return if current_user.superadmin?

      super
    end

    def set_resource
      @_resource = Api::Administration::MembershipPolicy::Scope.new(
        current_user, Membership
      ).resolve.find(params[:membership_id])
    end

    def policy_class_for_role(role)
      case role.to_s
        when 'project_admin' then Api::Administration::ProjectMembershipPolicy
        when 'campaign_admin' then Api::Administration::CampaignMembershipPolicy
        else Api::Administration::MembershipPolicy
      end
    end

    def policy_class
      @policy_class ||= policy_class_for_role(params.dig(:filter, :with_role))
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

    def check_geo_restriction_if_client_context
      return if current_user.superadmin?

      client = client_from_attributes
      client&.check_geo_restriction!
    end

    def client_from_attributes
      attrs = params.dig(:data, :attributes)
      return unless attrs

      if (id = attrs[:client_id] || attrs[:project_id])
        Client.find_by(id: id)&.client
      elsif (id = attrs[:campaign_id])
        Campaign.find_by(id: id)&.client
      end
    end
  end
end
