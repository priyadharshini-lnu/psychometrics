# frozen_string_literal: true

module System
  class ReportsController < BaseController
    def index
      form = policy_scope(Report).ransack(params[:q])
      @resources = form.result

      respond_to(&:json)
    end
  end
end
