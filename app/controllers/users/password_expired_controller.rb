# frozen_string_literal: true

module Users
  class PasswordExpiredController < Devise::PasswordExpiredController
    layout 'devise'
  end
end
