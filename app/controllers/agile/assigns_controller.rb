# frozen_string_literal: true

class Agile::AssignsController < ApplicationController
  include ::Threesixty::InitialState
  include AgileUserResult

  before_action :set_assign
  initial_state_for :show

  append_before_action :pundit_authorize

  private

  def set_assign
    @assign = policy_scope(Assign).find(params[:id])
  end

  def pundit_authorize
    authorize @assign
  end
end
