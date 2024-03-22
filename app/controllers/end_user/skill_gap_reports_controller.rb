# frozen_string_literal: true

class EndUser::SkillGapReportsController < ApplicationController
  def show
    user = User.find(params[:id])
    authorize(user, nil, policy_class: ::EndUser::SkillGapReportPolicy)

    render json: ::Idp::GetSkillGapReportData.call!(user)
  end
end
