# frozen_string_literal: true

module Api
  module Administration
    class UserPolicy < ::Administration::UserPolicy
      def show?
        @user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users) || @user.id == @record.id
      end

      def destroy?
        has_permission?(:projects, :manage_users, project_id: @record.project_id)
      end

      def toggle_enable_2fa?
        !@record.is_anonym? && has_permission?(:projects, :manage_users, project_id: @record.project_id)
      end

      def update?
        has_permission?(:projects, :manage_users, project_id: @record.project_id) || @user.id == @record.id
      end

      def current_user_details?
        true
      end

      def change_locale?
        true
      end

      def create_global_assessor?
        @user.is?(:superadmin)
      end

      def reset_password?
        has_permission?(:users, :reset_password, project_id: @record.project_id, campaign_id: campaign_id)
      end

      def change_password?
        true
      end

      class Scope < BasePolicy::Scope
        def resolve
          return scope.none unless @user

          geo_filtered_scope = scope.geo_scoped(Current.user_country).
                               includes(user_profile: { photo_attachment: :blob })

          return geo_filtered_scope if @user.is?(:superadmin)

          permitted_client_admin_project_ids = @user.client_admin_project_ids.select do |project_id|
            @user.has_permission?(:projects, :manage_users, project_id: project_id)
          end

          permitted_project_admin_project_ids = @user.project_admin_client_ids.select do |project_id|
            @user.has_permission?(:projects, :manage_users, project_id: project_id)
          end

          permitted_campaign_admin_project_ids = @user.campaign_admin_campaigns.select do |campaign|
            @user.has_permission?(
              :campaigns, :manage_users, project_id: campaign.project_id, campaign_id: campaign.id
            )
          end.pluck(:project_id)

          geo_filtered_scope.where(
            project_id: permitted_client_admin_project_ids.concat(
              permitted_project_admin_project_ids, permitted_campaign_admin_project_ids
            )
          ).or(User.where(id: @user.id))
        end
      end
    end
  end
end
