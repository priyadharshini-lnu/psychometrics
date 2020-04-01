# frozen_string_literal: true

class Agile::AssignsController < ApplicationController
  include ::Threesixty::InitialState

  before_action :set_assign
  initial_state_for :show

  append_before_action :pundit_authorize

  def show
    @assign.in_progress! if @assign.not_started?
    respond_to do |format|
      format.html { render 'threesixty/campaigns/show', layout: 'layouts/threesixty_campaign' }
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
    Assigns::SaveAgileEvent.call!(@assign, form)

    head :ok
  end

  private

  def set_assign
    @assign = policy_scope(Assign).find(params[:id])
  end

  def set_init_state
    init_state = super
    @init_state = super.merge(
      extras: init_state[:extras].merge(agileAssetsUrl: Settings.agile_config.asset_url)
    )
  end

  def pundit_authorize
    authorize @assign
  end
end
