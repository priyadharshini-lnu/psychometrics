# frozen_string_literal: true

module Api
  module Administration
    class BasePolicy
      def initialize(context, record, _extra = {})
        context ||= {}
        @current_user   = context[:current_user]
        @current_client = context[:current_client]
        @current_project = context[:current_project]
        @current_membership = context[:current_membership]
        @record = [record].flatten.last
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
