# frozen_string_literal: true

class Api::V2::Administration::UserIdpDevelopmentActionResource < Api::V2::Administration::BaseResource
  attributes :user_idp_plan_id, :development_action_id, :user_idp_skill_id, :custom_action,
             :custom_action_learning_style, :name, :description, :development_action_type, :course_url,
             :course_start_date, :course_end_date, :user_idp_development_action_id,
             :project_id, :learning_style, :image, :skill_ids, :progress,
             :start_date_time, :end_date_time

  has_one :development_action
  has_one :user_idp_skill

  delegate :name, :description, :development_action_type, :project_id, :skill_ids, :learning_style, :course_url,
           to: :development_action, allow_nil: true

  def user_idp_development_action_id
    @model.id
  end

  def course_start_date
    @model.development_action&.course_start_date&.strftime('%Y-%m-%d')
  end

  def course_end_date
    @model.development_action&.course_end_date&.strftime('%Y-%m-%d')
  end

  def image
    @model.development_action&.image_url
  end

  private

  def development_action
    @model.development_action
  end
end
