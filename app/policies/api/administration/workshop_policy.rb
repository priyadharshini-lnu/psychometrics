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

      def bulk_update_subjects?
        has_permission?(:workshops, :manage)
      end

      def show_relationship?
        has_permission?(:workshops, :manage)
      end

      def update_relationship?
        has_permission?(:workshops, :manage)
      end

      def get_related_resources?
        true
      end

      class Scope < Scope
        attr_reader :campaign_id

        def initialize(user, scope, opts = {})
          @user = user
          @scope = [scope].flatten.last
          @campaign_id = opts[:campaign_id]
        end

        def resolve
          return scope if user.superadmin?

          if campaign_id && user.has_permssion?(:workshops, :view, campaign_id: campaign_id)
            return user.accessible_records(Workshop, 'workshops.view')
          end

          Workshop.includes(:workshop_assessors).where(workshop_assessors: { user_id: user.id })
        end
      end
    end
  end
end
