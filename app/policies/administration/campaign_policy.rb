module Administration
  class CampaignPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin, :client_admin, :project_admin)
    end

    def manage_first_level?
      @user.is?(:superadmin)
    end

    def manage_project?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && @user.has_grant?(:clients, :manage))
    end

    def dimensions?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && @user.has_grant?(:clients, :manage))
    end

    def manage_threesixty?
      return true if @user.is?(:superadmin)
      return true if (@user.is?(:client_admin, :project_admin) && @user.has_grant?(:clients, :manage))
      false
    end

    def create?
      super || @user.has_grant?(:clients, :manage)
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

    def show?
      true
    end

    def dimensions?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && @user.has_grant?(:clients, :manage))
    end

    def factors?
      @user.is?(:superadmin) || (@user.is?(:client_admin) && @user.has_grant?(:clients, :manage))
    end

    def archive?
      edit?
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
      view_additional_fields?
    end

    class Scope < Scope
      def resolve
        return scope if @user.is?(:superadmin)
        scope
      end
    end
  end
end
