# frozen_string_literal: true

module Api
  class V2::Administration::MembershipsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction, except: %i[index]
    before_action :check_geo_restriction_if_client_context, only: %i[create update]
    before_action :authorize_import_client_assessors, only: :import_client_assessors

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
      return impersonate_on_root_domain(target_user) unless AdminSubdomain.client_admin_sso_enabled?

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

    def import_client_assessors
      form = Memberships::ImportClientAssessorsForm.new(
        import_data: import_client_assessors_params[:import_data]
      ).with_context(client: import_client)

      if form.valid?
        audit! :import_client_assessors,
               import_client,
               payload: { row_count: form.parsed_rows.size },
               record_type: Membership
        AdminJob.call(
          :import_client_assessors,
          { client_id: import_client.id },
          current_user,
          import_client_assessors_params[:import_data]
        )
        return render json: :ok
      end

      render json: { errors: form.errors.messages.map { |_k, v| v }.flatten }, status: :unprocessable_entity
    end

    private

    def impersonate_on_root_domain(target_user)
      impersonate_as_admin(target_user)
      redirect_to(root_admin_redirect_path_for(target_user))
    end

    def root_admin_redirect_path_for(target_user)
      target_user.assessors.exists? ? assessors_dashboard_path : "#{admin_path}/user_availabilities"
    end

    def authorize_spoof
      set_resource unless @_resource
      policy_klass = policy_class_for_role(@_resource.role)
      authorize @_resource, :spoof?, policy_class: policy_klass,
               project_id: @_resource.client_id, campaign_id: @_resource.campaign_id
    end

    def authorize_import_client_assessors
      authorize Membership, :create?, policy_class: Api::Administration::MembershipPolicy,
               project_id: import_client_assessors_params[:client_id]
    end

    def enforce_geo_restriction
      return if current_user.superadmin?

      super
    end

    def set_resource
      membership_id = params[:id] || params[:membership_id]

      @_resource = Api::Administration::MembershipPolicy::Scope.new(
        current_user, Membership
      ).resolve.find(membership_id)
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

    def import_client_assessors_params
      params.permit(:client_id, :import_data)
    end

    def import_client
      @import_client ||= Client.find_by(id: import_client_assessors_params[:client_id])
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
