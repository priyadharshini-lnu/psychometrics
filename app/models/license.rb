class License < ApplicationRecord
  belongs_to :client, counter_cache: true
  belongs_to :assessment
  belongs_to :report

  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  enum type: [:users, :sub_tenancies, :tenancy_branding,
              :assign_psychometrics, :assign_org_survey, :assign_360_feedback,
              :assign_report_psychometrics, :assign_report_org_survey, :assign_report_360_feedback,
              :assign_project,
              :client_assessment, :client_report,
              :assign_individual_assessment, :assign_individual_report]

  validates :client, presence: true
  validates :number, :overuse_number, :used_number,
            numericality: { greater_than_or_equal_to: 0 }
  validates :type,
            uniqueness: { scope: :client_id },
            unless: proc { assign_individual_assessment? || assign_individual_report? }
  # If type of License is individual assessment - validate presence assessment
  validates :assessment, presence: true, if: :assign_individual_assessment?
  # If type of License is individual report - validate presence report
  validates :report, presence: true, if: :assign_individual_report?

  before_save :set_licenses_to_zero, if: proc { unlimited_changed? && unlimited? }

  def used_overuse_number
    number >= used_number ? 0 : used_number - number
  end

  def enough_licenses?
    return false if client.licenses_final_expire&.< Date.today
    unlimited? || number + overuse_number > used_number
  end

  # If license became unlimited
  #   Then we set license counter to zero
  def set_licenses_to_zero
    self.number = 0
    self.overuse_number = 0
    self.used_number = 0
  end
end
