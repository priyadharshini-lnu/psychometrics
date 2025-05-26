# frozen_string_literal: true

# TODO: Policy is required
class EndUser::UserIdpSkillsController < ApplicationController
  append_before_action :pundit_authorize
  before_action :load_user_idp_skill, only: %i[update]

  def index
    user_idp_skills = user.user_idp_skills
    render json: ::Panko::ArraySerializer.new(
      user_idp_skills,
      each_serializer: ::EndUser::UserIdpSkillSerializer
    ).to_a
  end

  def save_skills
    skills_form = ::Idp::SaveUserIdpSkillsForm.new(skills_params).with_context(user: user)

    ::Idp::SaveUserIdpSkills.call(user.active_user_idp_plan, skills_form) do
      on(:ok) do |skills|
        render json: {
          data: ::Panko::ArraySerializer.new(
            skills,
            each_serializer: ::EndUser::UserIdpSkillSerializer
          ).to_a,
          category: skills_form.category
        }
      end
      on(:error) do |form|
        render json: form.errors.messages, status: 422
      end
    end
  end

  def update
    form = Idp::UpdateUserIdpSkillForm.new(update_params).
           with_context(user_idp_skill: @user_idp_skill, idp_template: @idp_template)

    if form.valid?
      @user_idp_skill.update!(form.attributes)
      render json: ::EndUser::UserIdpSkillSerializer.new.serialize(@user_idp_skill)
    else
      render json: form.errors.messages, status: 422
    end
  end

  private

  def user
    @user ||= params[:user_id].present? ? User.find(params[:user_id]) : current_user
  end

  def skills_params
    params.permit(:category, skills: %i[skill_id])
  end

  def update_params
    params.permit(:id, :initial_rating)
  end

  def load_user_idp_skill
    @user_idp_skill = user.user_idp_skills.includes(user_idp_plan: :idp_template).find(params[:id])
  end

  def pundit_authorize
    authorize(user, nil, policy_class: ::EndUser::UserIdpSkillsPolicy)
  end
end
