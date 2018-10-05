class AssessmentsReport < ApplicationRecord
  belongs_to :assessment
  belongs_to :report

  after_destroy_commit ::Callbacks::Models::AssessmentsReports::RemoveReportsModules.new
end
