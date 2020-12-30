# frozen_string_literal: true

class Assessors::UsersController < Administration::BaseController
  before_action :skip_authorization, only: [:dashboard]

  def dashboard
    raise NotAuthorizedError unless current_user.is?(:assessor)
  end
end
