# frozen_string_literal: true

class UserSkillGapReportSerializer < Panko::Serializer
  attributes :id, :status, :campaign_id, :pdf, :is_self, :results, :user, :report_url, :report_data,
             :campaign_ai_artifact_results, :module_overrides, :campaign_factor_results

  has_one :report, serializer: ReportSerializer

  def user
    ::Reports::UserSerializer.new(context: { campaign: context[:campaign] }).serialize(object.user)
  end

  def is_self
    object.user_id == current_user&.id
  end

  def results
    object.user_results.map do |result|
      ::Reports::ResultSerializer.new(context: { campaign: context[:campaign] }).serialize(result)
    end.group_by { |result| result['assessment_id'] }
  end

  def report_data
    UserReports::PrepareUserReportData.call!(object)
  end

  def report_url
    object.pdf_download_url
  end

  def campaign_factor_results
    object.campaign.campaign_factor_values.where(
      user_id: object.user_id, campaign_factors: { public_visibility: true }
    ).includes(:campaign_factor).map do |cfv|
      {
        code: cfv.campaign_factor.code,
        value: cfv.value,
        name: cfv.campaign_factor.name,
        description: cfv.campaign_factor.description
      }
    end
  end

  def campaign_ai_artifact_results
    results = Campaigns::AIArtifactResultsQuery.new(
      object.campaign_id, object.user_id
    ).query

    Panko::ArraySerializer.new(
      results,
      each_serializer: AI::CampaignArtifactResultSerializer
    ).to_a
  end

  def module_overrides
    Panko::ArraySerializer.new(
      raw_module_overrides,
      each_serializer: TextModuleOverrideSerializer
    ).to_a
  end

  private

  def current_user
    context[:current_user]
  end

  def raw_module_overrides
    TextModuleOverride.where(user_report_id: object.id)
  end

  def report
    ReportSerializer.new(
      context: {
        module_overrides: raw_module_overrides,
        user_results: context[:user_results],
        piped_text_context: context[:piped_text_context],
        campaign: context[:campaign],
        lang: context[:lang]
      }
    ).serialize(context[:report])
  end
end
