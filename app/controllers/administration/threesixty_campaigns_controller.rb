class Administration::ThreesixtyCampaignsController < Administration::BaseController
  before_action :set_resource
  before_action :pundit_authorize

  def reset
    ::Threesixty::Campaigns::Reset.call(resource)
    render json: :ok
  end

  def reset_nominations
    ::Threesixty::Campaigns::ResetAllNominations.call(resource)
    render json: :ok
  end

  private

  def set_resource
    @_resource = ::Threesixty::Campaign.find(params[:id])
  end
end
