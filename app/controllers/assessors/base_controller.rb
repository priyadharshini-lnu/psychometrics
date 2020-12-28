# frozen_string_literal: true

class Assessors::BaseController < Administration::BaseController
  def authenticate_user!
    if user_signed_in?
      sign_out current_user unless current_user.is?(:assessor)
    end
  end
end
