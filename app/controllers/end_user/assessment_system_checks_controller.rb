# frozen_string_literal: true

class EndUser::AssessmentSystemChecksController < ApplicationController
  SUPPORTED_STEPS = %w[system video audio network].freeze

  before_action :validate_step_key, only: [:step_completed]
  before_action :find_user_assessment, only: [:step_completed]

  def step_completed
    if step_key == 'video'
      handle_video_step(@user_assessment.id)
    else
      handle_general_step(step_key)
    end

    head :ok
  end

  private

  def validate_step_key
    unless SUPPORTED_STEPS.include?(step_key)
      render json: { error: 'Invalid step key' }, status: :unprocessable_entity
    end
  end

  def step_key
    @step_key = params[:step_key]
  end

  def find_user_assessment
    @user_assessment = current_user.user_assessments.find_by(id: params[:user_assessment_id])
    unless @user_assessment
      render json: { error: 'User assessment not found' }, status: :not_found
    end
  end

  def handle_video_step(user_assessment_id)
    video_data = JSON.parse(cookies['checking_wizard.video'] || '{}')
    video_data[user_assessment_id.to_s] = true
    add_cookie('checking_wizard.video', video_data.to_json, expires: 1.hour.from_now)
    add_cookie('checking_wizard.audio', true, expires: 4.hours.from_now)
  end

  def handle_general_step(step_key)
    add_cookie("checking_wizard.#{step_key}", true, expires: 4.hours.from_now)
  end
end
