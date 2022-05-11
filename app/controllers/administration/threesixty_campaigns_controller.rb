# frozen_string_literal: true

class Administration::ThreesixtyCampaignsController < Administration::BaseController
  before_action :set_resource
  before_action :pundit_authorize

  def reset
    remove_license_usage = current_user.is?(:superadmin) ? params['remove_licence_usage'] : nil
    audit! :reset, resource, campaign: resource.campaign
    ::Threesixty::Campaigns::Reset.call(
      threesixty_campaign: resource,
      updater_id: current_user.id,
      remove_license_usage: remove_license_usage
    )
    render json: :ok
  end

  def export_completion_status
    audit! :export_completion_status, resource, campaign: resource.campaign
    AdminJob.call(
      :threesixty_campaign_export_completion_status,
      { threesixty_campaign_id: resource.id },
      current_user
    )

    head :ok
  end

  def export_results
    results = ::Assessments::Export::RawAndScoring.call!(resource.assessment, resource.campaign)

    audit! :export_results, resource, campaign: resource.campaign
    respond_to do |format|
      format.xlsx { send_data results.to_stream.read, filename: 'assessment_raw_results.xlsx' }
    end
  end

  def reset_nominations
    audit! :reset_nominations, resource, campaign: resource.campaign
    ::Threesixty::Campaigns::ResetAllNominations.call(resource)
    render json: :ok
  end

  def destroy
    audit! :delete, resource, payload: resource.log_attribute_for_delete, campaign: resource.campaign
    resource.destroy!
    resource.camppaign.destroy!
  end

  def remove_user
    user = User.find(params[:user_id])
    audit! :remove_user, resource, payload: { user_id: params[:user_id] }, campaign: resource.campaign
    Threesixty::Campaigns::RemoveUser.call(user, resource)

    render json: :ok
  end

  private

  def set_resource
    @_resource = ::Threesixty::Campaign.find(params[:id])
  end
end
