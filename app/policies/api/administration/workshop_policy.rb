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

      class Scope < Scope
        def resolve
          return scope if user.superadmin?
          return user.accessible_records(Workshop, 'workshops.view') if
            user.has_permssion?(:workshops, :view, campaign_id: campaign_id)

          Workshop.includes(:workshop_assessors).where(workshop_assessors: { user_id: user.id })
        end
      end
    end
  end
end
