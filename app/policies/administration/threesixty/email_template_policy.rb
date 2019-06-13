# frozen_string_literal: true

module Administration
  module Threesixty
    class EmailTemplatePolicy < Administration::BasePolicy
      def index?
        # TODO (atanych): check campaign_id
        return true if @user.is?(:superadmin)
        return true if @user.is?(:client_admin, :project_admin) && @user.has_grant?(:clients, :manage)

        false
      end

      class Scope
        def initialize(user, scope)
          @user = user
          @scope = [scope].flatten.last
        end

        # scope - could be array [:administration, Model]
        def resolve
          puts "============================ #{scope}"
          [scope].flatten.last
        end
      end
    end
  end
end
