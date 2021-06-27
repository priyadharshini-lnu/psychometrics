# frozen_string_literal: true

module Administration
  class RegistrationCodePolicy < Administration::BasePolicy
    def download_qrcode?
      @user.is?(:superadmin) || @user.has_client_grant?(:registration_codes, :view, @project_id)
    end

    def create?
      @user.is?(:superadmin) || @user.has_client_grant?(:registration_codes, :manage, @project_id)
    end

    def destroy?
      @user.is?(:superadmin) || @user.has_client_grant?(:registration_codes, :manage, @project_id)
    end

    def update?
      @user.is?(:superadmin) || @user.has_client_grant?(:registration_codes, :manage, @project_id)
    end

    def index?
      @user.is?(:superadmin) || @user.has_client_grant?(:registration_codes, :view, @project_id)
    end

    def copy?
      @user.is?(:superadmin) || @user.has_client_grant?(:registration_codes, :view, @project_id)
    end
  end
end
