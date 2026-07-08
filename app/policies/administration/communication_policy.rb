# frozen_string_literal: true

module Administration
  class CommunicationPolicy < Administration::BasePolicy
    def index?
      @user.is?(:superadmin) || @user.has_grant?(:communications, :view)
    end

    def create?
      @user.is?(:superadmin) || @user.has_grant?(:communications, :manage)
    end

    def show?
      @user.is?(:superadmin) || @user.has_grant?(:communications, :view)
    end

    def copy?
      @user.is?(:superadmin) || @user.has_grant?(:communications, :manage)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_grant?(:communications, :manage)
    end

    def new_form?
      true
    end

    def download_history?
      @user.is?(:superadmin) || @user.has_grant?(:communications, :manage)
    end

    def edit?
      @user.is?(:superadmin) || @user.has_grant?(:communications, :manage)
    end

    def edit_translation?
      @user.is?(:superadmin) || @user.has_grant?(:communications, :manage)
    end

    def update_translation?
      @user.is?(:superadmin) || @user.has_grant?(:communications, :manage)
    end

    class Scope < Scope
      def resolve
        scope = super
        geo_filtered_scope = scope.geo_scoped(Current.user_country)
        return geo_filtered_scope if @user.is?(:superadmin)

        permitted_client_ids = @user.client_admin_client_ids.select do |client_id|
          @user.has_permission?(:communications, :view, project_id: client_id)
        end

        permitted_project_ids = @user.project_admin_client_ids.select do |project_id|
          @user.has_permission?(:communications, :view, project_id: project_id)
        end

        scope = geo_filtered_scope.where(
          'client_id IN (?) or communications.project_id IN (?)', permitted_client_ids, permitted_project_ids
        )
        if @user.is?(:campaign_admin)
          scope = scope.or(Communication.where(campaign_id: @user.campaign_admin_campaigns))
        end
        scope
      end
    end
  end
end
