module Administration
  class AssessmentPolicy < Administration::BasePolicy
    def index?
      super || @user.has_grant?(:assessments, :view)
    end

    # Can open builder of Assessment (Blocks, Questions and etc.)
    # true if it's Common Assessment
    #   and user is Superadmin or user has grants
    def show?
      @record.common? &&
        (super || @user.has_grant?(:assessments, :manage))
    end

    def create?
      super || @user.has_grant?(:assessments, :manage)
    end

    # Can open Websocket Channel for build Assessment (Blocks, Questions and etc.)
    # true if it's Common Assessment and user is Superadmin
    def open_channel?
      @record.common? && @user.is?(:superadmin)
    end

    # Can preview Assessment (Blocks, Questions and etc.)
    # true if it's Common Assessment
    #   and user is Superadmin or user has grants
    def preview?
      @record.common? &&
        (@user.is?(:superadmin) || @user.has_grant?(:assessments, :view))
    end

    def reports?
      @user.is?(:superadmin)
    end

    def assign?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :assign)
    end

    def view_report?
      return true if @user.is?(:superadmin)
      return true if @user.is?(:admin) && @record.psychometric? && @user.has_grant?(:assigns, :view)
      return true if @user.is?(:manager) && !@record.psychometric?
      false
    end

    def client_index?
      @user.is?(:superadmin, :admin)
    end

    def export_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :export)
    end

    def import_results?
      @user.is?(:superadmin) || @user.has_grant?(:assessments, :import)
    end

    # Can save Assessment (Blocks, Questions and etc.)
    # true if it's Common Assessment and user is Superadmin
    def save?
      @record.common? &&
        @user.is?(:superadmin)
    end

    # Can copy Assessment (Blocks, Questions and etc.)
    # true if it's Common Assessment
    def copy?
      @record.common? &&
        super
    end

    # Can export Assessment's questions and scoring
    # true if it's Common Assessment
    def export?
      @record.common? &&
        super
    end

    class Scope < Administration::BasePolicy::Scope
      def resolve
        scope = super
        return scope if @user.is?(:superadmin)
        if @user.has_grant?(:assessments, :view)
          scope.where(owner_id: @user.admin_clients.select('tte_id').distinct)
        else
          scope.none
        end
      end
    end
  end
end
