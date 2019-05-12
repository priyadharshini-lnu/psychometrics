class Administration::ThreesixtyCampaignsController < Administration::BaseController
  before_action :set_resource
  before_action :pundit_authorize

  def reset
    ::Threesixty::ResetCampaignJob.perform_later(resource.id)
    render json: :ok
  end

  def reset_nominations
    resource.participants.map(&:destroy!)
    render json: :ok
  end

  private

  def set_resource
    @_resource = ::Threesixty::Campaign.find(params[:id])
  end
end
