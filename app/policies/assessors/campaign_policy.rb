# frozen_string_literal: true

module Assessors
  class CampaignPolicy < BasePolicy
    def index?
      @user.is?(:assessor)
    end
  end
end
