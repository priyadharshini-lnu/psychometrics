# frozen_string_literal: true

class Game::AssignsController < ApplicationController
  before_action :set_assign
  append_before_action :pundit_authorize

  def show
    render json: @assign, serializer: Assigns::GameSerializer
  end

  def update
    form = Assigns::GameForm.from_params(params)
    if form.valid?
      Assigns::SaveGameData.call!(form.attributes)
    else
      render json: { errors: form.errors.full_messages }, status: :bad_request
    end
  end

  def game_log
    # Code to save game log
  end

  private

  def set_assign
    @assign = policy_scope(Assign).find(params[:id])
  end

  def pundit_authorize
    authorize @assign
  end
end
