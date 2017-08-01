module Administration
  class ReportPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:reports, :view)
    end

    # Can open builder of Report (Reports, Modules and etc.)
    # true if it's not Mindmill report
    #   and user is Superadmin or user has grants
    def show?
      return false if record.mindmill?
      super || @user.has_grant?(:reports, :view)
    end

    def create?
      permit = @user.has_grant?(:reports, :manage)
      permit = permit && @user.admin_clients_tte_ids.include?(record.owner_id) if record.is_a? ::Report
      super || permit
    end

    # Can open Websocket Channel for build Report (Reports, Modules and etc.)
    # true if it's not Mindmill report and user is Superadmin
    def open_channel?
      !@record.mindmill? && @user.is?(:superadmin)
    end

    # Can preview Report
    # true if it's not Mindmill report and user is Superadmin
    def preview?
      return false if @record.mindmill?
      return true if @user.is?(:superadmin)
      return true if @user.is?(:admin) && @record.assessment.psychometric? && @user.has_grant?(:reports, :view)
      false
    end

    def left_menu?
      index?
    end

    def sidebar?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
    end

    def toggle_status?
      edit?
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)
        return scope.none unless @user.has_grant?(:reports, :view)
        owner_ids = @user.admin_clients_tte_ids
        admin_client_ids = @user.admin_client_ids
        client_end_levels = Client.end_level.where('id in (?) or ancestry ~ ?', admin_client_ids, "/(#{admin_client_ids.join('|')})(/|$)")
        scope
            .enabled
            .available_to_view
            .joins(:clients).where('clients.id in (?) or reports.owner_id in (?)', client_end_levels.ids, owner_ids)
      end
    end
  end
end
