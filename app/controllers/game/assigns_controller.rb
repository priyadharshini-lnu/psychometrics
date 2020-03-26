# frozen_string_literal: true

class Game::AssignsController < ApplicationController
  before_action :set_assign
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
    form = Assigns::GameForm.from_params(params)
    if form.valid?
      Assigns::SaveGameData.call!(form.attributes)
    else
      render json: { errors: form.errors.full_messages }, status: :bad_request
    end
  end

  def events
    render json: { status: :ok }
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
