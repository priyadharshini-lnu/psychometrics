# frozen_string_literal: true

module AgileUserResult
  extend ActiveSupport::Concern

  def show
    if user_assessment.not_started?
      user_assessment.update!(started_at: Time.zone.now, status: :in_progress)
      UserAssessments::Webhook.new(user_assessment).publish_assessment_started if user_assessment
    end

    respond_to do |format|
      format.html { render 'end_user/users/dashboard', layout: 'layouts/end_user' }
      format.json do
        render json: UsersResults::AgileSerializer.new.serialize(user_result).
          transform_keys { |k| k.to_s.camelcase(:lower) }
      end
    end
  end

  def update
    form = UsersResults::AgileForm.new(params.permit!)
    if form.valid?
      UsersResults::SaveAgileData.call!(user_result, form)
    else
      render json: { errors: form.errors.full_messages }, status: 400
    end
  end

  def set_language
    user_assessment.update!(selected_locale: params[:locale])

    head :ok
  end

  def events
    form = UsersResults::AgileEventForm.from_params(params)
    UsersResults::SaveAgileEvent.call!(user_result, form, current_user)

    head :ok
  end

  private

  def user_assessment
    user_result.try(:user_assessment)
  end

  def user_result
    @user_result || @assign
  end
end
