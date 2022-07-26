# frozen_string_literal: true

module Api
  module Administration
    class BasePolicy
      private_attr_accessor :user, :record, :project_id, :campaign_id

      def initialize(user, record, extras = {})
        @user = user
        @record = [record].flatten.last
        @project_id = extras[:project_id]
        @campaign_id = extras[:campaign_id]
      end

      def has_permission?(resource_type, permission)
        @user.has_permission?(
          resource_type, permission, project_id: project_id, campaign_id: campaign_id
        )
      end

      class Scope
        attr_reader :user, :scope

        def initialize(user, scope)
          @user = user
          @scope = scope.is_a?(Array) ? scope.last : scope
        end

        # scope - could be array
        # [:administration, Model]
        #
        def resolve
          scope
        end
      end
    end
  end
end
