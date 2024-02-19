# frozen_string_literal: true

class ShortUserReportSerializer < Panko::Serializer
  attributes :id, :status, :campaign_id, :project_id, :poster, :name, :report_id, :external_report

  def campaign_id
    object.campaign.id
  end

  def project_id
    object.project.id
  end

  def name
    object.report.name
  end

  def poster
    object.report.poster.url
  end

  def external_report
    object.report.external_report?
  end

  private

  def current_user
    scope
  end
end
