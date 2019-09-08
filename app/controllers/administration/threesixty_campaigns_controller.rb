# frozen_string_literal: true

class Administration::ThreesixtyCampaignsController < Administration::BaseController
  before_action :set_resource
  before_action :pundit_authorize

  def reset
    ::Threesixty::Campaigns::Reset.call(resource)
    render json: :ok
  end

  def export_completion_status
    results = Threesixty::Campaigns::ExportCompletionStatus.call!(resource)
    respond_to do |format|
      format.xlsx { send_data results.to_stream.read, filename: "completion_status_export_campaign_#{resource.id}.xlsx" }
    end
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
