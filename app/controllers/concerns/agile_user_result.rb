# frozen_string_literal: true

module AgileUserResult
  extend ActiveSupport::Concern

  def show
    if user_assessment.not_started?
      user_assessment_locale = user_assessment.selected_locale
      if params[:lang].present? &&
         user_assessment_locale.nil? &&
         user_assessment.available_locales.include?(params[:lang])
        user_assessment_locale = params[:lang]
      end
      UserAssessments::Begin.call!(user_assessment, user_assessment_locale)
      UserAssessments::Webhook.new(user_assessment).publish_assessment_started if user_assessment
    end

    respond_to do |format|
      format.html { render 'end_user/users/dashboard', layout: 'layouts/end_user' }
      format.json do
        render json: UsersResults::AgileSerializer.new(
          context: {
            filtered_locales: params[:filtered_locales] || false
          }
        ).serialize(user_result).
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
    translations = user_assessment.assessment.agile.translations[params[:locale]]
    render json: { translations: translations }, status: :ok
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
    @user_result
  end
end
