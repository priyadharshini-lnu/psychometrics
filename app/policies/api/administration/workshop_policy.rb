# frozen_string_literal: true

module Api
  module Administration
    class WorkshopPolicy < ::Administration::BasePolicy
      def create_bulk_workshops?
        has_permission?(:workshops, :manage)
      end

      def index?
        has_permission?(:workshops, :view) || user.assessor?
      end

      def show?
        has_permission?(:workshops, :view) || user.assessor?
      end

      def update?
        has_permission?(:workshops, :manage)
      end

      def create?
        has_permission?(:workshops, :manage)
      end

      def bulk_update_subjects?
        has_permission?(:workshops, :manage)
      end

      def change_status?
        has_permission?(:workshops, :manage)
      end

      def show_relationship?
        has_permission?(:workshops, :manage)
      end

      def update_relationship?
        has_permission?(:workshops, :manage)
      end

      def remove_workshop?
        has_permission?(:workshops, :manage) || @user.superadmin?
      end

      def get_related_resources?
        true
      end

      private

      def can_manage?
        has_permission?(:workshops, :manage)
      end

      class Scope < BasePolicy::Scope
        def resolve
          new_scope = if user.superadmin?
                        scope
                      elsif campaign_id && user.has_permission?(:workshops, :view, campaign_id: campaign_id)
                        user.accessible_records(Workshop, 'workshops.view')
                      else
                        Workshop.accessible_as_assessor_or_manager(user)
                      end

          geo_filtered_scope = new_scope.geo_scoped(Current.user_country)
          return geo_filtered_scope.where(campaign_id: campaign_id) if campaign_id

          geo_filtered_scope
        end
      end
    end
  end
end
