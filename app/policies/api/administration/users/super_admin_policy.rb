# frozen_string_literal: true

module Api
  module Administration
    module Users
      class SuperAdminPolicy < Api::Administration::UserPolicy
        def show?
          @user.admin?
        end
      end
    end
  end
end
