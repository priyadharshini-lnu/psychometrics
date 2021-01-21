# frozen_string_literal: true

module Assessors
  class UserReportPolicy < BasePolicy
    def show?
      @user.is?(:assessor)
    end

    def download?
      @user.is?(:assessor)
    end

    def pdf_preview?
      @user.is?(:assessor)
    end
  end
end
