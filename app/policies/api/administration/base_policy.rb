# frozen_string_literal: true

module Api
  module Administration
    class BasePolicy
      private_attr_accessor :user, :record

      def initialize(user, record, _extra = {})
        @user = user
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
