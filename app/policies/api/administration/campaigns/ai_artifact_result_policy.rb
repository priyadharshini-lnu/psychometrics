# frozen_string_literal: true

module Api
  module Administration
    module Campaigns
      class AIArtifactResultPolicy < ::Administration::UserPolicy
        def index?
          feature_enabled? && can_view?
        end

        def update?
          feature_enabled? && can_manage?
        end

        def show?
          feature_enabled? && can_view?
        end

        def generate?
          feature_enabled? && can_manage?
        end

        def test_generate?
          feature_enabled? && can_manage?
        end

        def bulk_generate?
          feature_enabled? && can_manage?
        end

        class Scope < Administration::BasePolicy::Scope
          def resolve
            scope.where(campaign_id: campaign_id)
          end
        end

        private

        def feature_enabled?
          campaign&.project&.client&.feature_enabled?(:ai_assistants) &&
            campaign&.project&.project_feature_enabled?(:ai_assistants)
        end

        def can_view?
          superadmin? || permission_granted?('view')
        end

        def can_manage?
          superadmin? || permission_granted?('manage')
        end

        def permission_granted?(permission)
          has_permission?(
            'ai_artifacts',
            permission,
            project_id: campaign&.project_id,
            campaign_id: campaign&.id
          )
        end

        def campaign
          @campaign ||= if campaign_id.present?
                          Campaign.find_by(id: campaign_id)
                        end
        end

        def superadmin?
          @user.is?(:superadmin)
        end
      end
    end
  end
end
