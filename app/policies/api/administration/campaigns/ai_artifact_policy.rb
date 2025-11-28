# frozen_string_literal: true

module Api
  module Administration
    module Campaigns
      class AIArtifactPolicy < ::Administration::UserPolicy
        def index?
          feature_enabled? && can_view?
        end

        def create?
          feature_enabled? && can_manage?
        end

        def update?
          feature_enabled? && can_manage?
        end

        def destroy?
          feature_enabled? && can_manage?
        end

        def show?
          feature_enabled? && can_view?
        end

        def export?
          feature_enabled? && can_export?
        end

        def import?
          feature_enabled? && can_import?
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
          campaign&.project&.project_feature_enabled?(:ai_assistants)
        end

        def can_view?
          superadmin? || permission_granted?('view')
        end

        def can_manage?
          superadmin? || permission_granted?('manage')
        end

        def can_import?
          superadmin? || permission_granted?('import')
        end

        def can_export?
          superadmin? || permission_granted?('export')
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
          @campaign ||= if record.respond_to?(:campaign) && record.campaign.present?
                          record.campaign
                        elsif record.is_a?(Campaign)
                          record
                        elsif campaign_id.present?
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
