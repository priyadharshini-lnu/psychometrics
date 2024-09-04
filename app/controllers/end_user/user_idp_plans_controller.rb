# frozen_string_literal: true

module EndUser
  class UserIdpPlansController < ApplicationController
    def summary
      authorize(user, nil, policy_class: ::EndUser::UserIdpPlanPolicy)

      render json: DevelopmentPlanSummarySerializer.new.serialize(user)
    end

    private

    def user
      User.find(params[:user_id])
    end
  end
end
