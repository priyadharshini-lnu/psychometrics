# frozen_string_literal: true

module Api
  module Administration
    class AssessmentConsentSettingPolicy < ::Administration::AssessmentPolicy
      def show?
        has_permission?(:assessments, :manage, project_id: record.assessment.owner_id)
      end

      def update?
        show?
      end

      class Scope < Scope
        def resolve
          if user.is?(:superadmin)
            scope.all
          else
            scope.joins(:assessment).where(assessments: { owner_id: user.client_ids })
          end
        end
      end
    end
  end
end
