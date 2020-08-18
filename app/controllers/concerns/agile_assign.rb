# frozen_string_literal: true

module AgileAssign
  extend ActiveSupport::Concern

  def show
    @assign.in_progress! if @assign.not_started?
    respond_to do |format|
      format.html { render 'end_user/users/dashboard', layout: 'layouts/end_user' }
      format.json do
        render json: @assign, serializer: Assigns::AgileSerializer
      end
    end
  end

  def update
    form = Assigns::AgileForm.new(params.permit!)
    if form.valid?
      Assigns::SaveAgileData.call!(@assign, form)
    else
      render json: { errors: form.errors.full_messages }, status: :bad_request
    end
  end

  def set_language
    @assign.update!(selected_locale: params[:locale])

    head :ok
  end

  def events
    form = Assigns::AgileEventForm.from_params(params)
    Assigns::SaveAgileEvent.call!(@assign, form, current_user)

    head :ok
  end
end
