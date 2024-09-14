# frozen_string_literal: true

class EndUser::IdpTemplateSkillsController < ApplicationController
  def index
    skill_templates = current_user.idp_template_skills.includes(:skill).
                      order(:category).page(params[:page]).per(params[:per_page])

    render json: ::Panko::ArraySerializer.new(
      skill_templates,
      each_serializer: ::EndUser::IdpSkillSerializer
    ).to_a
  end
end
