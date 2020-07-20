# frozen_string_literal: true

class Agile::AssignsController < ApplicationController
  include ::Threesixty::InitialState
  include AgileAssign

  before_action :set_assign
  initial_state_for :show

  append_before_action :pundit_authorize

  private

  def set_assign
    @assign = policy_scope(Assign).find(params[:id])
  end

  def set_init_state
    init_state = super
    @init_state = super.merge(
      config: init_state[:config].merge(agileAssetsUrl: Settings.agile_config.asset_url)
    )
  end

  def pundit_authorize
    authorize @assign
  end
end
