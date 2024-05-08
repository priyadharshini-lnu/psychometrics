# frozen_string_literal: true

class EndUser::DirectReportsController < ApplicationController
  def index
    plans = UserIdpPlan.joins(:user).where(users: { manager_id: current_user.id }).where(
      status: %i[pending_approval approved], active: true
    )

    render json: {
      data: ::Panko::ArraySerializer.new(
        plans,
        each_serializer: ::EndUser::DirectReportSerializer
      ).to_a,
      meta: {}
    }
  end
end
