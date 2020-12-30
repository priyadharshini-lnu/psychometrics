# frozen_string_literal: true

module Assessors
  class UserPolicy < BasePolicy
    def dashboard?
      @user.is?(:assessor)
    end
  end
end
