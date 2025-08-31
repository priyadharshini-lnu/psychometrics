# frozen_string_literal: true

module Api
  module Administration
    module Campaigns
      class AIArtifactResultPolicy < ::Administration::UserPolicy
        def index?
          @user.is?(:superadmin)
        end

        def update?
          @user.is?(:superadmin)
        end

        def show?
          @user.is?(:superadmin)
        end

        def generate?
          @user.is?(:superadmin)
        end

        def test_generate?
          @user.is?(:superadmin)
        end

        def bulk_generate?
          @user.is?(:superadmin)
        end

        class Scope < Administration::BasePolicy::Scope
          def resolve
            scope.where(campaign_id: campaign_id)
          end
        end
      end
    end
  end
end
