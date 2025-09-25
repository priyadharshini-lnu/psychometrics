# frozen_string_literal: true

class EndUser::SkillsController < ApplicationController
  before_action :load_idp_template, only: :index

  def index
    skills = if params[:filters].present?
               @idp_template.available_skills(plan_id: @user_idp_plan.id).ransack(params[:filters]).result.limit(10)
             else
               @idp_template.available_skills(plan_id: @user_idp_plan.id).sample_by_skill_types
             end

    render json: ::Panko::ArraySerializer.new(
      skills,
      each_serializer: ::EndUser::SkillSerializer
    ).to_a
  end

  private

  def load_idp_template
    @user_idp_plan = current_user.
                     association(:active_user_idp_plan).
                     scope.
                     includes(
                       idp_template: :skills
                     ).
                     first
    @idp_template = @user_idp_plan.idp_template
  end
end
