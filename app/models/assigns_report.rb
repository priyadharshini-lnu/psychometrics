# frozen_string_literal: true

# == Schema Information
#
# Table name: assigns_reports
#
#  id                :integer          not null, primary key
#  report_id         :integer
#  assign_id         :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  access_reports_at :datetime
#

class AssignsReport < ApplicationRecord
  LICENSES = {
    Assessment::PSYCHOMETRIC    => Licenses::AssignReportPsychometrics,
    Assessment::ORGANISATIONAL  => Licenses::AssignReportOrgSurvey,
    Assessment::CASE_STUDY      => Licenses::AssignReportCaseStudy,
    Assessment::NUM_360         => Licenses::AssignReport_360_Feedback,
    Assessment::MINDMILL        => Licenses::AssignReportMindmill,
    Assessment::HOGAN           => Licenses::AssignReportHogan
  }.freeze

  belongs_to :assign, inverse_of: :assigns_reports
  belongs_to :report, inverse_of: :assigns_reports
  has_many :license_usages, inverse_of: :assigns_report # on delete nullify

  before_create :use_license
  before_create :set_user_access
  after_commit ::Callbacks::Models::AssignsReports::UpdateOrRemoveReportsAccess.new

  mount_base64_uploader :external_report, FileUploader, file_name: proc { 'external_report' }

  private

  def use_license
    LICENSES[assign.assessment.category].use(self)
  end

  def set_user_access
    self.user_access = assign.user_access
  end
end
