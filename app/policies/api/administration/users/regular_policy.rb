# frozen_string_literal: true

module Api
  module Administration
    module Users
      class RegularPolicy < Api::Administration::UserPolicy
        class Scope < BasePolicy::Scope
          def resolve
            geo_filtered_scope = scope.geo_scoped(Current.user_country)

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
            )
          end
        end
      end
    end
  end
end
