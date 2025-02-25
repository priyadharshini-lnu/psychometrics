# frozen_string_literal: true

class EndUser::UserIdpSkillsController < ApplicationController
  before_action :load_user_idp_skill, only: %i[update]

  def index
    user_idp_skills = current_user.user_idp_skills
    render json: ::Panko::ArraySerializer.new(
      user_idp_skills,
      each_serializer: ::EndUser::UserIdpSkillSerializer
    ).to_a
  end

  def create
    form = ::Idp::CreateSkillsForm.new(skills_params).with_context(user: current_user)

    skills = []
    if form.valid?
      UserIdpSkill.transaction do
        form.skills.each do |skill|
          skills << UserIdpSkill.find_or_create_by!(
            user_idp_plan_id: current_user.active_user_idp_plan.id, skill_id: skill['skill_id']
          )
        end
      end

      render json: {
        data: ::Panko::ArraySerializer.new(
          skills,
          each_serializer: ::EndUser::UserIdpSkillSerializer
        ).to_a
      }
    else
      render json: form.errors.messages, status: 422
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

  def skills_params
    params.permit(skills: %i[skill_id])
  end

  def update_params
    params.permit(:id, :initial_rating)
  end

  def load_user_idp_skill
    @user_idp_skill = current_user.user_idp_skills.includes(user_idp_plan: :idp_template).find(params[:id])
  end
end
