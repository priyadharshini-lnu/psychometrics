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

  def export_threesixty_scores
    audit! :export_threesixty_scores, resource, campaign: resource.campaign
    AdminJob.call(
      :threesixty_campaign_export_scores,
      { campaign_id: resource.campaign_id, export_with_labels: false },
      current_user
    )
    head :ok
  end

  def export_results
    audit! :export_results, resource, campaign: resource.campaign
    with_labels = params[:with_labels] == 'true'
    AdminJob.call(
      :assessment_raw_result_export,
      { assessment_id: resource.assessment_id, campaign_id: resource.campaign_id, export_with_labels: with_labels },
      current_user
    )
    head :ok
  end

  def import_results
    audit! :import_results, resource, campaign: resource.campaign
    AdminJob.call(:import_raw_data, {
      assessment_id: resource.assessment_id,
      campaign_id: resource.campaign_id,
      scoring: params[:scoring] == 'true'
    }, current_user, params[:file])

    render json: :ok
  end

  def reset_nominations
    audit! :reset_nominations, resource, campaign: resource.campaign
    ::Threesixty::Campaigns::ResetAllNominations.call(resource)
    render json: :ok
  end

  def rescore_assessment
    AdminJob.call(
      :rescore_assessment, { campaign_id: resource.campaign_id, assessment_id: resource.assessment_id }, current_user
    )
    render json: :ok
  end

  def regenerate_reports
    AdminJob.call(
      :bulk_regenerate_threesixty_reports, { campaign_id: resource.id }, current_user
    )
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

  def pundit_authorize
    authorize(
      resource || resource_class,
      nil,
      {
        threesixty_campaign: resource,
        project_id: params[:project_id] || resource&.campaign&.project_id
      }
    )
  end

  def set_resource
    @_resource = ::Threesixty::Campaign.find(params[:id])
  end
end
