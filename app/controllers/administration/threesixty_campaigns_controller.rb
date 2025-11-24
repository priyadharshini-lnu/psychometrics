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
    if params[:selected_user_report_ids].blank?
      return render json: { errors: I18n.t('administration.bulk_reports.select_users_for_regenerate') },
                    status: :unprocessable_entity
    end

    AdminJob.call(
      :bulk_regenerate_threesixty_reports,
      { campaign_id: resource.id, locales: params[:selected_locales], force_regenerate: params[:force_regenerate],
        ids: params[:selected_user_report_ids] },
      current_user
    )
    render json: :ok
  end

  def bulk_download
    if params[:selected_user_report_ids].blank?
      return render json: { errors: I18n.t('administration.bulk_reports.select_users_for_download') },
                    status: :unprocessable_entity
    end

    report_count = UserReportPdf.where(user_report_id: params[:selected_user_report_ids],
                                       locale: params[:selected_locales]).joins(:pdf_file_attachment).count
    if report_count > 1000
      return render json: { errors: I18n.t('campaign_report.messages.bulk_download_error', count: report_count) },
                    status: :unprocessable_entity
    end

    if report_count.zero?
      return render json: { errors: I18n.t('campaign_report.messages.bulk_download_no_reports') },
                    status: :unprocessable_entity
    end

    AdminJob.call(:bulk_download_user_reports,
                  { campaign_id: resource.campaign_id, is_threesixty: true, locales: params[:selected_locales],
                    is_bulk_action: true, ids: params[:selected_user_report_ids] },
                  current_user)
    audit! :bulk_download, nil, record_type: 'UserReport', payload: {}, campaign: campaign
    head :ok
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

  def toggle_caching
    campaign_assessment = resource.campaign.campaign_assessments.find_by(assessment: resource.assessment)
    campaign_assessment.update!(caching_enabled: params[:caching_enabled])
    audit! :toggle_caching, campaign_assessment, payload: { caching_enabled: campaign_assessment.caching_enabled? },
           campaign: campaign

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
    @_resource = ::Campaign.find(params[:id]).threesixty_campaign
  end
end
