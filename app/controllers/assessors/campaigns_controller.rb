# frozen_string_literal: true

class Assessors::CampaignsController < Assessors::BaseController
  skip_after_action :verify_policy_scoped, only: :index

  def index; end
end
