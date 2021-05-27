# frozen_string_literal: true

module Administration
  class CampaignPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :view)
    end

    def show?
      @user.is?(:superadmin, :client_admin, :project_admin)
    end

    def edit?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage)
    end

    def copy?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage)
    end

    def manage_first_level?
      @user.is?(:superadmin)
    end

    def manage_project?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && @user.has_grant?(:clients, :manage))
    end

    def manage_threesixty?
      return true if @user.is?(:superadmin)
      return true if @user.is?(:client_admin, :project_admin) && @user.has_grant?(:clients, :manage)

      false
    end

    def create?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage)
    end

    def projects?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :manage)
    end

    def sub_campaigns?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :manage)
    end

    def client_admins?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && record.client_admins.exists?(@user.id))
    end

    def project_admins?
      record.prime_project? && @user.is?(:superadmin, :client_admin)
    end

    def dimensions?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && @user.has_grant?(:clients, :manage))
    end

    def archive?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage)
    end

    def edit_tte?
      @user.is?(:superadmin)
    end

    def design?
      @user.is?(:superadmin) || @user.has_grant?(:clients, :design)
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
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :view)
    end

    def fetch_campaign_options?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :view)
    end

    def fetch_campaign_instructions?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :view)
    end

    def update_campaign_options?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_options)
    end

    def manage_messages?
      @user.is?(:superadmin) || @user.has_grant?(:campaigns, :manage_messages)
    end

    class Scope < Scope
      def resolve
        return scope if @user.is?(:superadmin)

        scope
      end
    end
  end
end
