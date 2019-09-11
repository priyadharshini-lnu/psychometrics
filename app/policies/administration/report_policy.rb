# frozen_string_literal: true

module Administration
  class ReportPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:reports, :view)
    end

    # Can open builder of Report (Reports, Modules and etc.)
    # true if it's not Mindmill report
    #   and user is Superadmin or user has grants
    def show?
      @record.hogan_report_setting.blank? &&
        !@record.mindmill &&
        (super || @user.has_grant?(:reports, :view))
    end

    def create?
      permit = @user.has_grant?(:reports, :manage)
      ttes_ids = @user.is?(:client_admin) ? @user.client_admin_clients_tte_ids : @user.project_admin_clients_tte_ids
      permit &&= ttes_ids.include?(record.owner_id) if record.is_a? ::Report
      super || permit
    end

    def hogan_reports?
      create?
    end

    def upload_data_sheet?
      create?
    end

    # Can open Websocket Channel for build Report (Reports, Modules and etc.)
    # true if it's not Mindmill report and user is Superadmin
    def open_channel?
      @user.is?(:superadmin)
    end

    # Can preview Report
    # true if it's not Mindmill report and user is Superadmin
    def preview?
      return true if @user.is?(:superadmin)
      return true if (@user.is?(:client_admin) || @user.is?(:project_admin)) && @record.assessment.psychometric? &&
                     @user.has_grant?(:assigns, :view)

      false
    end

    # Can export Report Data?
    #
    def export?
      @user.is?(:superadmin)
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

    # Can archive/unarchive Assessment
    def toggle_archive?
      @user.is?(:superadmin)
    end

    # Can regenerate reports if Superadmin
    #   and record is not external
    #
    def regenerate?
      @user.is?(:superadmin) && !record.try(:external_report?)
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)

        tte_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_clients_tte_ids
        client_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_client_ids
        client_end_level_ids = Client.end_level.
                               where('id in (?) or ancestry ~ ?', client_ids, "(/|^)(#{client_ids.join('|')})(/|$)").ids
        scope.
          enabled.
          available_to_view.
          joins(:clients).where('clients.id in (?) or reports.owner_id in (?)', client_end_level_ids, tte_ids)
      end
    end
  end
end
