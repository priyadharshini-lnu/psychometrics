# frozen_string_literal: true

module Administration
  class ClientPolicy < Administration::BasePolicy
    def index?
      super || @user.is?(:campaign_admin) || @user.has_grant?(:clients, :view)
    end

    def view_licenses?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :view_licenses)
    end

    def view_audit_reports?
      has_permission?(:audit_reports, :user_report_events, project_id: project_id) ||
        has_permission?(:audit_reports, :admin_permissions, project_id: project_id)
    end

    def view_data_reports?
      has_permission?(:clients, :export_data_report, project_id: project_id)
    end

    def copy?
      if record.project? || record.campaign? || record.sub_campaign?
        record.active? && (@user.is?(:superadmin) || @user.has_permission?(:projects, :manage, project_id: project_id))
      else
        record.active? && @user.is?(:superadmin)
      end
    end

    def destroy?
      if record.project? || record.campaign? || record.sub_campaign?
        @user.is?(:superadmin) || @user.has_permission?(:projects, :manage, project_id: project_id)
      else
        @user.is?(:superadmin)
      end
    end

    def edit?
      if record.project? || record.campaign? || record.sub_campaign?
        @user.is?(:superadmin) || @user.has_permission?(:projects, :manage, project_id: project_id)
      else
        @user.is?(:superadmin)
      end
    end

    def manage_first_level?
      @user.is?(:superadmin)
    end

    def manage_project?
      @user.is?(:superadmin) || @user.has_permission?(:projects, :manage, project_id: project_id)
    end

    def new?
      @user.is?(:superadmin) || @user.has_grant?(:projects, :manage)
    end

    def manage_campaign?
      return true if @user.is?(:superadmin)
      return true if @user.has_permission?(:campaigns, :manage, project_id: project_id)

      false
    end

    def create?
      super || @user.has_grant?(:clients, :manage) || @user.has_grant?(:projects, :manage)
    end

    def projects?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :manage)
    end

    def manage_project_admins?
      @user.is?(:superadmin) || @user.has_permission?(:projects, :manage_admins, project_id: project_id)
    end

    def project_admins?
      record.prime_project? && @user.has_permission?(:projects, :manage_admins, project_id: project_id)
    end

    def search_users?
      return true if @user.is?(:superadmin)
      return true if @user.is?(:client_admin) && @user.client_ids.include?(record.client.id)

      @user.is?(:project_admin, :campaign_admin) && @user.client_ids.include?(record.id)
    end

    def show?
      true
    end

    def archive?
      edit?
    end

    def edit_tte?
      @user.is?(:superadmin)
    end

    def design?
      @user.is?(:superadmin) || @user.has_permission?(:project_settings, :design, project_id: project_id)
    end

    def profile?
      has_permission?(:project_settings, :profile)
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

    class Scope < Scope
      def resolve
        return scope if superadmin_bypass?

        permitted_ids = permitted_client_admin_clients_ids +
                        permitted_project_admin_client_ids +
                        permitted_campaign_admin_project_ids +
                        assessor_campaigns_project_ids

        client_ids = restrict_to_client_subtree(permitted_ids)
        return scope.none if client_ids.empty?

        clients = scope.where(id: client_ids).not_retails.select(:id, :ancestry)
        return scope.none if clients.empty?

        client_ids, ancestors = clients.map { |c| [c.id, c.ancestry] }.transpose
        client_ids ||= []
        ancestor_ids = ancestors.nil? ? [] : ancestors.compact.map { |path| path.split('/').map(&:to_i) }.flatten.uniq
        scope.where('clients.id in (?) or ancestry ~ ?', ancestor_ids + client_ids,
                    "(^|\\D)(#{client_ids.join('|')})(/|$)")
      end

      private

      def permitted_client_admin_clients_ids
        @user.client_admin_client_ids.select do |client_id|
          @user.has_permission?(:clients, :view, project_id: client_id)
        end
      end

      def permitted_project_admin_client_ids
        @user.project_admin_client_ids.select do |project_id|
          @user.has_permission?(:projects, :view, project_id: project_id)
        end
      end

      def permitted_campaign_admin_project_ids
        campaign_admin_memberships = @user.memberships.includes(:campaign).where(
          role: Membership::CAMPAIGN_ADMIN_ROLE,
          disabled: false
        )
        campaign_admin_memberships.filter_map do |membership|
          campaign = membership.campaign
          next unless campaign

          campaign.project_id if @user.has_permission?(
            :campaigns,
            :view,
            project_id: campaign.project_id,
            campaign_id: campaign.id
          )
        end
      end

      def assessor_campaigns_project_ids
        @user.assessors_campaigns.pluck(:project_id)
      end
    end
  end
end
