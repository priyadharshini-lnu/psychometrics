# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
module Administration
  class CampaignPolicy < Administration::BasePolicy
    def index?
      has_permission?(:campaigns, :view)
    end

    def timeseries?
      has_permission?(:campaigns, :view_stats)
    end

    def datasheet_filter_options?
      has_permission?(:campaigns, :view_stats)
    end

    def show?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :view, campaign_id: record.id
      ) || (@user.assessor? && @user.assessors_campaigns.include?(record))
    end

    def edit?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage, project_id: project_id, campaign_id: campaign_id
      )
    end

    def copy?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage, project_id: project_id
      )
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage, project_id: project_id
      )
    end

    def manage_first_level?
      @user.is?(:superadmin)
    end

    def manage_project?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && @user.has_permission?(
        :clients, :manage, project_id: project_id
      ))
    end

    def manage_admins?
      @user.is?(:superadmin) || @user.has_permission?(:projects, :manage_admins, project_id: project_id)
    end

    def manage_campaign_admins?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_admins, project_id: project_id, campaign_id: campaign_id
      )
    end

    def manage_threesixty?
      return true if @user.is?(:superadmin)
      return true if @user.is?(
        :client_admin, :project_admin
      ) && @user.has_permission?(:clients, :manage, project_id: project_id)

      false
    end

    def create?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage, project_id: project_id
      )
    end

    def update?
      has_permission?(:campaigns, :manage)
    end

    def projects?
      @user.is?(:superadmin) || @user.has_permission?(:clients, :manage, project_id: project_id)
    end

    def client_admins?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && record.client_admins.exists?(@user.id))
    end

    def project_admins?
      record.prime_project? && @user.is?(:superadmin, :client_admin)
    end

    def dimensions?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && @user.has_permission?(
        :clients, :manage, project_id: project_id
      ))
    end

    def archive?
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage, project_id: project_id)
    end

    def edit_tte?
      @user.is?(:superadmin)
    end

    def design?
      @user.is?(:superadmin) || @user.has_permission?(:project_settings, :design, project_id: project_id)
    end

    def export?
      @user.is?(:superadmin)
    end

    def view_additional_fields?
      @user.is?(:superadmin)
    end

    def edit_additional_fields?
      @user.is?(:superadmin)
    end

    def templates_and_assessment?
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :view, project_id: project_id)
    end

    def fetch_campaign_options?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :view, project_id: project_id, campaign_id: campaign_id
      )
    end

    def fetch_campaign_instructions?
      has_permission?(:campaigns, :manage_options)
    end

    def fetch_descriptions?
      has_permission?(:campaigns, :manage_options)
    end

    def update_campaign_options?
      has_permission?(:campaigns, :manage_options)
    end

    def manage_messages?
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_messages, project_id: project_id)
    end

    def manage_campaigns?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage, project_id: project_id, campaign_id: campaign_id
      )
    end

    def view_registration_codes?
      @user.is?(:superadmin) || @user.has_permission?(
        :registration_codes, :view, project_id: project_id, campaign_id: campaign_id
      )
    end

    def stats?
      has_permission?(:campaigns, :view_stats)
    end

    def view_dashboard?
      has_permission?(:dashboards, :view)
    end

    def view_assessors?
      has_permission?(:assessors, :view)
    end

    def view_accesssheet?
      has_permission?(:dashboards, :accesssheet_view)
    end

    def view_accesssheet_settings?
      has_permission?(:dashboards, :accesssheet_settings)
    end

    def export_dashboard_to_file?
      has_permission?(:dashboards, :export)
    end

    def view_datasheets?
      @user.is?(:superadmin) || @user.has_permission?(
        :datasheets, :view, project_id: project_id, campaign_id: campaign_id
      )
    end

    def view_workshops?
      has_permission?(:workshops, :view) ||
        Workshop.includes(:workshop_assessors).where( # rubocop:disable Rails/WhereExists
          workshop_assessors: { user_id: user.id }, campaign_id: campaign_id
        ).exists?
    end

    def view_workshop_invites?
      has_permission?(:workshops, :view)
    end

    def manage_project_smtp_settings?
      @user.is?(:superadmin) || @user.has_permission?(
        :project_settings, :smtp, project_id: project_id
      )
    end

    def view_sms_invites?
      @user.is?(:superadmin) || @user.has_permission?(
        :sms_invites, :view, project_id: project_id, campaign_id: campaign_id
      )
    end

    def view_assessments_and_reports?
      has_permission?(:campaigns, :view)
    end

    def manage_report_approval_settings?
      has_permission?(:campaigns, :manage_report_approvals)
    end

    def manage_ai_scoring_approval_settings?
      has_permission?(:campaigns, :manage_ai_scoring_approval_settings)
    end

    def assign_user?
      can_manage_campaign_users?
    end

    def update_campaign_user?
      can_manage_campaign_users?
    end

    def assessments_reports?
      can_manage_campaign?
    end

    def duplicate?
      can_manage_campaign?
    end

    def pdf_password?
      @user.is?(:superadmin)
    end

    def view_campaign_scoring?
      has_permission?(:results, :scores)
    end

    def view_campaign_scoring_setting?
      has_permission?(:campaign_factors, :view)
    end

    def manage_campaign_scoring?
      has_permission?(:campaign_factors, :manage)
    end

    def view_audit_reports?
      has_permission?(:audit_reports, :user_report_events, project_id: project_id, campaign_id: campaign_id) ||
        has_permission?(:audit_reports, :admin_permissions, project_id: project_id, campaign_id: campaign_id)
    end

    private

    def can_manage_campaign?
      @user.has_permission?(
        :campaigns, :manage, project_id: project_id, campaign_id: campaign_id
      )
    end

    def can_manage_campaign_users?
      @user.has_permission?(
        :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
      )
    end

    def view_ai_artifacts?
      return false unless record.project.project_feature_enabled?(:ai_assistants)

      @user.is?(:superadmin) ||
        has_permission?(
          'ai_artifacts',
          'view',
          project_id: record.project_id,
          campaign_id: record.id
        ) ||
        has_permission?(
          'ai_artifacts',
          'manage',
          project_id: record.project_id,
          campaign_id: record.id
        )
    end

    def manage_idp_plans?
      has_permission?(:user_idp_plans, :manage)
    end

    class Scope < Scope
      def initialize(user, scope, options = {})
        @user = user
        @scope = [scope].flatten.last
        @permission = options[:permission] || :view
        @group = options[:group] || :campaigns
      end

      def resolve
        return scope if superadmin_bypass?

        permitted_client_admin_project_ids = @user.client_admin_project_ids.select do |project_id|
          @user.has_permission?(@group, @permission, project_id: project_id)
        end

        permitted_project_admin_project_ids = @user.project_admin_client_ids.select do |project_id|
          @user.has_permission?(@group, @permission, project_id: project_id)
        end

        permitted_campaign_ids = @user.campaign_admin_campaigns.select do |campaign|
          @user.has_permission?(@group, @permission, project_id: campaign.project_id, campaign_id: campaign.id)
        end.pluck(:id)

        permitted_campaign_ids += @user.assessors_campaigns.pluck(:id)

        permitted_client_admin_project_ids = restrict_to_client_subtree(permitted_client_admin_project_ids)
        permitted_project_admin_project_ids = restrict_to_client_subtree(permitted_project_admin_project_ids)
        if client_admin_scoped?
          valid_campaign_ids = Campaign.where(project_id: client_admin_subtree_ids).pluck(:id)
          permitted_campaign_ids &= valid_campaign_ids
        end

        scope.where(
          'campaigns.id IN (?) OR campaigns.project_id IN (?)',
          permitted_campaign_ids, permitted_client_admin_project_ids + permitted_project_admin_project_ids
        )
      end
    end
  end
end
# rubocop:enable Metrics/ClassLength
