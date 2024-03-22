# frozen_string_literal: true

module Idp
  class GetSkillGapReportData < BaseCommand
    attr_accessor :user

    def initialize(user)
      @user = user
    end

    def call
      broadcast :ok, ::SkillGapReportSerializer.new({
        context: {
          campaign: user.user_idp_plan.campaign
        }
      }).serialize(user)
    end
  end
end
