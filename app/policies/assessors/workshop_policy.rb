# frozen_string_literal: true

module Assessors
  class WorkshopPolicy < BasePolicy
    def index?
      @user&.is?(:assessor)
    end
  end
end
