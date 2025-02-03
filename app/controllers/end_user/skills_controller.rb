# frozen_string_literal: true

class EndUser::SkillsController < ApplicationController
  before_action :load_idp_template, only: :index

  def index
    skills = if params[:filters].present?
               @idp_template.skills.ransack(params[:filters]).result.limit(10)
             else
               Skill.joins(:idp_template_skills).
                 where(idp_template_skills: { idp_template_id: @idp_template.id }).
                 sample_by_categories
             end

    render json: ::Panko::ArraySerializer.new(
      skills,
      each_serializer: ::EndUser::SkillSerializer
    ).to_a
  end

  private

  def load_idp_template
    @idp_template = current_user.
                    association(:active_user_idp_plan).
                    scope.
                    includes(
                      idp_template: :skills
                    ).
                    first.
                    idp_template
  end
end
