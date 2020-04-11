# frozen_string_literal: true

module Administration
  class RegistrationCodePolicy < Administration::BasePolicy
    def download_qrcode?
      @user.admin?
    end
  end
end
