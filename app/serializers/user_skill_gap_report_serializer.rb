# frozen_string_literal: true

class UserSkillGapReportSerializer < Panko::Serializer
  attributes :id, :status, :campaign_id, :pdf, :is_self, :results, :user, :report_url, :report_data,
             :campaign_ai_artifact_results

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

  def campaign_ai_artifact_results
    results = Campaigns::AIArtifactResultsQuery.new(
      object.campaign_id, object.user_id
    ).query

    Panko::ArraySerializer.new(
      results,
      each_serializer: AI::CampaignArtifactResultSerializer
    ).to_a
  end

  private

  def current_user
    context[:current_user]
  end

  def module_overrides
    TextModuleOverride.where(user_report_id: object.id)
  end

  def report
    ReportSerializer.new(
      context: {
        module_overrides: module_overrides,
        include: '**'
      }
    ).serialize(context[:report])
  end
end
