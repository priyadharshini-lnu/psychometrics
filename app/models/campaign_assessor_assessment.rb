# frozen_string_literal: true

class CampaignAssessorAssessment < ApplicationRecord
  audited

  belongs_to :campaign
  belongs_to :assessment
  belongs_to :campaign_assessment_group
  include Tenantable
  include OwnerCompatibility

  has_many :factors, -> { distinct }, through: :assessment
  validate :campaign_owner_compatibility_with_assessment_owner,
           if: :validate_campaign_owner_compatibility_with_assessment_owner?

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name]
  end

  private

  def validate_campaign_owner_compatibility_with_assessment_owner?
    return false if campaign.blank? || assessment.blank?

    new_record? || will_save_change_to_campaign_id? || will_save_change_to_assessment_id?
  end

  def campaign_owner_compatibility_with_assessment_owner
    return if compatible_owner_ids?(campaign.tenant_id, assessment.owner_id)

    add_owner_compatibility_error(
      :assessment_id,
      child_resource: :assessment,
      parent_resource: :campaign
    )
  end
end
