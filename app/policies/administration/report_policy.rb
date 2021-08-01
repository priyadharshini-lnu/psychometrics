# frozen_string_literal: true

module Administration
  class ReportPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :view)
    end

    # Can open builder of Report (Reports, Modules and etc.)
    # true if it's not Mindmill report
    #   and user is Superadmin or user has grants
    def show?
      @record.provider_internal? &&
        (super || @user.has_grant?(:reports, :view))
    end

    def new?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
    end

    def create?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
    end

    def copy?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :manage, project_id)
    end

    def edit?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :manage, project_id)
    end

    def external_reports?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
    end

    def upload_data_sheet?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :manage, project_id)
    end

    # Can archive/unarchive Assessment
    def toggle_archive?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :manage, project_id)
    end

    # Can open Websocket Channel for build Report (Reports, Modules and etc.)
    # true if it's not Mindmill report and user is Superadmin
    def open_channel?
      @user.is?(:superadmin)
    end

    # Can preview Report
    # true if it's not Mindmill report and user is Superadmin
    def preview?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :view, project_id)
    end

    # Can export Report Data?
    #
    def export?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :view, project_id)
    end

    def left_menu?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :view)
    end

    def sidebar?
      @user.is?(:superadmin) || @user.has_grant?(:reports, :manage)
    end

    def toggle_status?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :manage, project_id)
    end

    # Can regenerate reports if Superadmin
    #   and record is not external
    #
    def regenerate?
      @user.is?(:superadmin) && !record.try(:external_report?)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :manage, project_id)
    end

    def soft_delete?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :manage, project_id)
    end

    def restore?
      @user.is?(:superadmin) || @user.has_permission?(:reports, :manage, project_id)
    end

    class Scope < Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)

        tte_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_clients_tte_ids

        report_permitted_tte_ids = tte_ids.uniq.each_with_object([]) do |tte_id, permitted_tte_ids|
          permitted_tte_ids << tte_id if @user.has_permission?(:reports, :view, tte_id)
        end

        scope.enabled.available_to_view.where(owner_id: report_permitted_tte_ids)
      end
    end
  end
end
