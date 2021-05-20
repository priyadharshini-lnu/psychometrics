# frozen_string_literal: true

module Administration
  class RegistrationCodePolicy < Administration::BasePolicy
    def download_qrcode?
      @user.is?(:superadmin) || @user.has_grant?(:registration_codes, :view)
    end

    def create?
      @user.is?(:superadmin) || @user.has_grant?(:registration_codes, :manage)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_grant?(:registration_codes, :manage)
    end

    def update?
      @user.is?(:superadmin) || @user.has_grant?(:registration_codes, :manage)
    end

    def index?
      @user.is?(:superadmin) || @user.has_grant?(:registration_codes, :view)
    end

    def copy?
      @user.is?(:superadmin) || @user.has_grant?(:registration_codes, :view)
    end
  end
end
