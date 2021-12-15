# frozen_string_literal: true

module Administration
  class CampaignPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :view, project_id: project_id, campaign_id: campaign_id
      )
    end

    def show?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :view, project_id: project_id, campaign_id: campaign_id
      )
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

    def projects?
      @user.is?(:superadmin) || @user.has_permission?(:clients, :manage, project_id: project_id)
    end

    def sub_campaigns?
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
      @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_options, project_id: project_id)
    end

    def update_campaign_options?
      @user.is?(:superadmin) || @user.has_permission?(
        :campaigns, :manage_options, project_id: project_id, campaign_id: campaign_id
      )
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

    def view_datasheets?
      @user.is?(:superadmin) || @user.has_permission?(
        :datasheets, :view, project_id: project_id, campaign_id: campaign_id
      )
    end

    def manage_project_smtp_settings?
      @user.is?(:superadmin) || @user.has_permission?(
        :project_settings, :smtp, project_id: project_id
      )
    end

    class Scope < Scope
      def resolve
        return scope if @user.is?(:superadmin, :client_admin, :project_admin)

        permitted_campaign_ids = @user.campaign_admin_campaigns.select do |campaign|
          @user.has_permission?(:campaigns, :view, project_id: campaign.project_id, campaign_id: campaign.id)
        end.pluck(:id)

        scope.where(id: permitted_campaign_ids)
      end
    end
  end
end
