# frozen_string_literal: true

class CampaignIdp < ApplicationRecord
  belongs_to :campaign
  belongs_to :idp_template
  include Tenantable

  has_many :dependencies, class_name: 'CampaignIdpDependency', dependent: :destroy

  has_many :questions, -> { where(campaign_idp_dependencies: { dependency_type: 'Question' }) },
           through: :dependencies,
           source: :dependency,
           source_type: 'Question'

  accepts_nested_attributes_for :dependencies, allow_destroy: true
end
