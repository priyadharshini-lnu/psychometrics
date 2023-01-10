# frozen_string_literal: true

class AssignsReport < ApplicationRecord
  LICENSES = {
    Assessment::PSYCHOMETRIC => Licenses::AssignReportPsychometrics,
    Assessment::ORGANISATIONAL => Licenses::AssignReportOrgSurvey,
    Assessment::CASE_STUDY => Licenses::AssignReportCaseStudy,
    Assessment::THREESIXTY => Licenses::CreateThreesixtySubject,
    Assessment::MINDMILL => Licenses::AssignReportMindmill,
    Assessment::HOGAN => Licenses::AssignReportHogan,
    Assessment::AGILE => Licenses::AssignReportAgile
  }.freeze

  belongs_to :assign, inverse_of: :assigns_reports
  belongs_to :report, inverse_of: :assigns_reports
  has_many :license_usages, inverse_of: :assigns_report, autosave: true # on delete nullify

  scope :active, -> { joins(:report).where.not(reports: { disabled: true }) }

  before_create :use_license
  # TODO: seems that this callback is redundant. Investigate
  after_commit ::Callbacks::Models::AssignsReports::UpdateOrRemoveReportsAccess.new

  mount_base64_uploader :external_report, Private::FileUploader, file_name: proc { 'external_report' }
  mount_uploader :pdf, Private::PdfUploader

  # TODO: (atanych): temp hack
  def status
    return 'ready' if !generating? && pdf&.url

    'not_ready'
  end

  private

  def use_license
    LICENSES[assign.assessment.category].use(self)
  end
end
