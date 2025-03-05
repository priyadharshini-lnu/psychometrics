# frozen_string_literal: true

module System
  class MembershipsController < BaseController
    def index
      form = policy_scope(Membership).ransack(params[:q])
      @resources = form.result.join_user

      respond_to(&:json)
    end
  end
end
