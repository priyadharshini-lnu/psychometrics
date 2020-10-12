# frozen_string_literal: true

module AgileUserResult
  extend ActiveSupport::Concern

  def show
    user_result.in_progress! if user_result.not_started?
    respond_to do |format|
      format.html { render 'end_user/users/dashboard', layout: 'layouts/end_user' }
      format.json do
        render json: user_result, serializer: UsersResults::AgileSerializer
      end
    end
  end

  def update
    form = UsersResults::AgileForm.new(params.permit!)
    if form.valid?
      UsersResults::SaveAgileData.call!(user_result, form)
    else
      render json: { errors: form.errors.full_messages }, status: :bad_request
    end
  end

  def set_language
    user_result.update!(selected_locale: params[:locale])

    head :ok
  end

  def events
    form = UsersResults::AgileEventForm.from_params(params)
    UsersResults::SaveAgileEvent.call!(user_result, form, current_user)

    head :ok
  end

  private

  def user_result
    @user_result || @assign
  end
end
