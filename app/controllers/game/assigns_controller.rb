# frozen_string_literal: true

class Game::AssignsController < ApplicationController
  include ::Threesixty::InitialState

  before_action :set_assign
  initial_state_for :show

  append_before_action :pundit_authorize

  def show
    respond_to do |format|
      # format.html { render 'show', layout: false }
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
    render json: { status: :ok }
  end

  def events
    @assign.game_logs.create!(event_params)
    render json: { status: :ok }
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

  def event_params
    data = params[:data].permit! if params[:data].is_a?(ActionController::Parameters)
    params.permit(:session_id, :event).merge(data: data)
  end

  def pundit_authorize
    authorize @assign
  end
end
