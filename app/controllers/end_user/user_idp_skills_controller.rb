# frozen_string_literal: true

# TODO: Policy is required
class EndUser::UserIdpSkillsController < ApplicationController
  append_before_action :pundit_authorize
  before_action :load_user_idp_skill, only: %i[update toggle_privacy revert_to_public]

  def index
    user_idp_skills = user.user_idp_skills
    render json: ::Panko::ArraySerializer.new(
      user_idp_skills,
      each_serializer: ::EndUser::UserIdpSkillSerializer
    ).to_a
  end

  def save_skills
    skills_form = ::Idp::SaveUserIdpSkillsForm.new(skills_params).with_context(user: user)

    ::Idp::SaveUserIdpSkills.call(user_idp_plan, skills_form, current_user) do
      on(:ok) do |skills|
        render json: {
          data: ::Panko::ArraySerializer.new(
            skills,
            each_serializer: ::EndUser::UserIdpSkillSerializer
          ).to_a,
          skill_type: skills_form.skill_type
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

  def toggle_privacy
    ::Idp::ToggleSkillPrivacy.call(@user_idp_skill, current_user) do
      on(:ok) do |result|
        render json: {
          success: true,
          message: result[:message],
          data: ::EndUser::UserIdpSkillSerializer.new.serialize(result[:skill])
        }
      end
      on(:error) do |error_message|
        render json: {
          success: false,
          error: error_message
        }, status: 422
      end
    end
  end

  def revert_to_public
    ::Idp::RevertSkillToPublic.call(@user_idp_skill, current_user) do
      on(:ok) do |result|
        render json: {
          success: true,
          message: result[:message],
          requires_approval: result[:requires_approval],
          data: ::EndUser::UserIdpSkillSerializer.new.serialize(result[:skill])
        }
      end
      on(:error) do |error_message|
        render json: {
          success: false,
          error: error_message
        }, status: 422
      end
    end
  end

  private

  def user_idp_plan
    @user_idp_plan ||= user.active_user_idp_plan
  end

  def user
    @user ||= params[:user_id].present? ? User.find(params[:user_id]) : current_user
  end

  def skills_params
    params.permit(:skill_type, skills: %i[skill_id])
  end

  def update_params
    params.permit(:id, :initial_rating)
  end

  def load_user_idp_skill
    @user_idp_skill = user.user_idp_skills.includes(user_idp_plan: :idp_template).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Skill not found'
    }, status: 404
  end

  def pundit_authorize
    authorize(user, nil, policy_class: ::EndUser::UserIdpSkillsPolicy, user_idp_plan: user_idp_plan)
  end
end
