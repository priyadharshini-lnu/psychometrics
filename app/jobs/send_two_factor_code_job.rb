# frozen_string_literal: true

class SendTwoFactorCodeJob < ApplicationJob
  queue_as :two_factor_codes

  def perform(user, code)
    TwoFactorMailer.two_factor_code_email(user, code).deliver_now
  end
end
