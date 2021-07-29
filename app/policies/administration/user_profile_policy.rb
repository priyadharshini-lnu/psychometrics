# frozen_string_literal: true

module Administration
  class UserProfilePolicy < Administration::BasePolicy
    def edit?
      @user.is?(:superadmin) || @user == record
    end

    def update?
      @user.is?(:superadmin) || @user == record
    end
  end
end
