# frozen_string_literal: true

class EndUser::UserIdpSkillsController < ApplicationController
  def index
    user_idp_skills = current_user.user_idp_skills
    render json: ::Panko::ArraySerializer.new(
      user_idp_skills,
      each_serializer: ::EndUser::UserIdpSkillSerializer
    ).to_a
  end

  def update
    user_idp_skill = current_user.user_idp_skills.find(params[:id])

    if user_idp_skill.update(initial_rating: params[:skill_rating])
      render json: ::EndUser::UserIdpSkillSerializer.new.serialize(user_idp_skill)
    else
      render json: { errors: user_idp_skill.errors.full_messages }, status: 422
    end
  end
end
