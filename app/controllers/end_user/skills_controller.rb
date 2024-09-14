# frozen_string_literal: true

class EndUser::SkillsController < ApplicationController
  def index
    skills = ::Skill.ransack(params[:filters]).result.limit(10)

    render json: ::Panko::ArraySerializer.new(
      skills,
      each_serializer: ::EndUser::SkillSerializer
    ).to_a
  end
end
