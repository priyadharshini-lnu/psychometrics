# frozen_string_literal: true

class Agile::Anonym::AssignsController < ActionController::Base
  include AuthenticateAnonymousUser
  include AgileAssign

  before_action :authenticate_anonymous_user!
  before_action :set_assign

  def set_assign
    @assign = Assign.find_by!(id: params[:id], membership_id: @anonymous_user.membership_ids).assign_with_result
  end
end
