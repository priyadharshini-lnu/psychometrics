# frozen_string_literal: true

class EndUser::SkillGapReportsController < ApplicationController
  def show
    user = User.find(params[:id])
    authorize(user, nil, policy_class: ::EndUser::SkillGapReportPolicy)

    options = {
      lang: params[:lang],
      current_user: current_user
    }
    res = ::Idp::GetSkillGapReportData.call(user, options)

    if res[:ok]
      render json: res[:ok]
    else
      render json: { errors: res[:error] }, status: :not_found
    end
  end
end
