# frozen_string_literal: true

class EndUser::DirectReporteesController < ApplicationController
  append_before_action :pundit_authorize

  def index
    plans = Idp::DirectReporteesQuery.new(current_user.id, @current_project.id).query

    paginated_plans = plans.page(params[:page]).per(params[:page_size] || 25)

    render json: {
      data: ::Panko::ArraySerializer.new(
        paginated_plans,
        each_serializer: ::EndUser::DirectReporteeSerializer
      ).to_a,
      meta: {
        count: plans.count
      }
    }
  end

  private

  def pundit_authorize
    authorize(current_user, nil, policy_class: ::EndUser::DirectReporteePolicy)
  end
end
