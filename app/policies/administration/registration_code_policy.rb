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
      create?
    end

    def update?
      create?
    end

    def index?
      @user.is?(:superadmin) || @user.has_grant?(:registration_codes, :view)
    end

    def copy?
      @user.is?(:superadmin) || @user.has_grant?(:registration_codes, :view)
    end
  end
end
