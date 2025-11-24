# frozen_string_literal: true

class EndUser::SkillsController < ApplicationController
  before_action :load_user_idp_plan, only: :index

  def index
    available_skills = Idp::IdpPlan::AvailableSkillsQuery.new(@user_idp_plan).query

    skills = if params[:filters].present?
               available_skills.ransack(params[:filters]).result.limit(10)
             else
               available_skills.sample_by_skill_types
             end

    render json: ::Panko::ArraySerializer.new(
      skills,
      each_serializer: ::EndUser::SkillSerializer
    ).to_a
  end

  private

  def load_user_idp_plan
    @user_idp_plan = current_user.
                     association(:active_user_idp_plan).
                     scope.
                     includes(
                       idp_template: :skills
                     ).
                     first
  end
end
