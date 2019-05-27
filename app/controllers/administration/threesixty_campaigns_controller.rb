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

  def destroy
    resource.destroy!
    resource.camppaign.destroy!
  end

  def remove_user
    user = User.find(params[:user_id])
    Threesixty::Campaigns::RemoveUser.call(user, resource)

    render json: :ok
  end

  private

  def set_resource
    @_resource = ::Threesixty::Campaign.find(params[:id])
  end
end
