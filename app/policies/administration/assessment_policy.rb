# frozen_string_literal: true

module Administration
  class AssessmentPolicy < Administration::BasePolicy
    include ::Administration::Assessments::CommonPolicy

    def index?
      super || @user.has_grant?(:assessments, :view)
    end

    def new?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :manage)
    end

    def create?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :manage)
    end

    def edit?
      @user.is?(:superadmin) || @user.has_permission?(:assessments, :manage, project_id: project_id)
    end

    def update?
      @user.is?(:superadmin) || @user.has_permission?(:assessments, :manage, project_id: project_id)
    end

    def other?
      has_permission?(:campaigns, :view)
    end

    def copy?
      @user.is?(:superadmin) || @user.has_permission?(:assessments, :manage, project_id: project_id)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_permission?(:assessments, :manage, project_id: project_id)
    end

    # Can archive/unarchive Assessment
    def toggle_archive?
      @user.is?(:superadmin) || @user.has_permission?(:assessments, :manage, project_id: project_id)
    end

    def assessments?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :view)
    end

    def questions?
      @user.is?(:superadmin) || @user.has_permission?(:assessments, :view, project_id: project_id)
    end

    def toggle_status?
      @user.is?(:superadmin) || @user.has_permission?(:assessments, :manage, project_id: project_id)
    end

    def content_resources?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :view)
    end

    # Can open builder of Assessment (Blocks, Questions and etc.)
    # true if it's Common or Microsite Assessment
    #   and user is Superadmin or user has grants
    def show?
      (@record.common? || @record.microsite?) &&
        (super || @user.has_permission?(:assessments, :manage, project_id: project_id))
    end

    # Can open Websocket Channel for build Assessment (Blocks, Questions and etc.)
    # true if it's Common or Microsite Assessment and user is Superadmin
    def open_channel?
      (@record.common? || @record.microsite?) &&
        (@user.is?(:superadmin) || @user.has_permission?(:assessments, :manage, project_id: @record.owner_id))
    end

    # Can preview Assessment (Blocks, Questions and etc.)
    # true if it's Common or Microsite Assessment
    #   and user is Superadmin or user has grants
    def preview?
      (@record.common? || @record.microsite?) &&
        (@user.is?(:superadmin) || @user.has_permission?(:assessments, :view, project_id: project_id))
    end

    def reports?
      @user.is?(:superadmin)
    end

    def assign?
      false # @user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)
    end

    def view_report?
      return true if @user.is?(:superadmin)
      return true if @user.is?(:client_admin) && @user.has_grant?(:assigns, :view)
      return true if @user.is?(:project_admin) && @record.psychometric? && @user.has_grant?(:assigns, :view)
      return true if @user.is?(:manager) && !@record.psychometric?

      false
    end

    def client_index?
      @user.is?(:superadmin, :client_admin, :project_admin)
    end

    def import_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :import)
    end

    def can_configure_universal_links?
      !@record.external? && @user.is?(:superadmin)
    end

    def enable_universal_links?
      @user.is?(:superadmin)
    end

    def disable_universal_links?
      @user.is?(:superadmin)
    end

    # Can save Assessment (Blocks, Questions and etc.)
    # true if it's Common or Microsite Assessment and user is Superadmin
    def save?
      (@record.common? || @record.microsite?) &&
        @user.is?(:superadmin)
    end

    def factors?
      # @user.is?(:superadmin) || @user.has_permission?(:assessments, :view, project_id: project_id)
      # moved to controller
      # TODO: figure out fore better solution
      true
    end

    def upload_data_sheet?
      create?
    end

    def soft_delete?
      @user.is?(:superadmin) || @user.has_permission?(:assessments, :manage, project_id: project_id)
    end

    def restore?
      @user.is?(:superadmin) || @user.has_permission?(:assessments, :manage, project_id: project_id)
    end

    def pearson_norms?
      @user.is?(:superadmin) || @user.has_permission?(:assessments, :manage, project_id: project_id)
    end

    def projects?
      can_manage_asssessment?
    end

    def external_assessments?
      can_manage_asssessment?
    end

    def import_questions?
      has_permission?(:assessments, :manage, project_id: record.owner_id)
    end

    def import_questions_sample_file?
      import_questions?
    end

    def export_questions?
      has_permission?(:assessments, :manage, project_id: record.owner_id)
    end

    private

    def can_manage_asssessment?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :manage)
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        scope = super.with_attached_icon.with_attached_poster
        return scope if @user.is?(:superadmin)

        owner_ids = @user.is?(:client_admin) ? @user.client_admin_client_ids : @user.project_admin_clients_tte_ids

        permitted_owner_ids = owner_ids.uniq.select do |owner_id|
          @user.has_permission?(:assessments, :view, project_id: owner_id)
        end

        scope.where(owner_id: permitted_owner_ids)
      end
    end
  end
end
