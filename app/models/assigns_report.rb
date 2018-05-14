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
      Assessment::PSYCHOMETRIC => Licenses::AssignReportPsychometrics,
      Assessment::ORGANISATIONAL => Licenses::AssignReportOrgSurvey,
      Assessment::NUM_360 => Licenses::AssignReport_360_Feedback,
      Assessment::MINDMILL => Licenses::AssignReportMindmill
  }.freeze
  belongs_to :assign
  belongs_to :report
  has_many :license_usages # on delete nullify

  before_create :use_license

  mount_base64_uploader :external_report, FileUploader, file_name: proc { 'external_report' }

  private

  def use_license
    LICENSES[assign.assessment.category].use(self)
  end
end
