# frozen_string_literal: true

class Game::AssignsController < ApplicationController
  include ::Threesixty::InitialState

  before_action :set_assign
  initial_state_for :show

  append_before_action :pundit_authorize

  def show
    respond_to do |format|
      format.html { render 'threesixty/campaigns/show', layout: 'layouts/threesixty_campaign' }
      format.json do
        render json: @assign, serializer: Assigns::GameSerializer
      end
    end
  end

  def update
    form = Assigns::GameForm.new(params.permit!)
    if form.valid?
      Assigns::SaveGameData.call!(@assign, form)
    else
      render json: { errors: form.errors.full_messages }, status: :bad_request
    end
  end

  def set_language
    @assign.update!(selected_locale: params[:local])

    head :ok
  end

  def events
    form = Assigns::GameEventForm.from_params(params)
    Assigns::SaveGameEvent.call!(@assign, form)

    head :ok
  end

  private

  def set_assign
    @assign = policy_scope(Assign).find(params[:id])
  end

  def set_init_state
    init_state = super
    @init_state = super.merge(
      extras: init_state[:extras].merge(gameAssetsUrl: Settings.game_config.asset_url)
    )
  end

  def pundit_authorize
    authorize @assign
  end
end
