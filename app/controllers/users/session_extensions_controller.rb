# frozen_string_literal: true

class Users::SessionExtensionsController < ApplicationController
  before_action :authenticate_user!

  def extend
    if current_user
      head :ok
    else
      head :unauthorized
    end
  end
end
