# frozen_string_literal: true

class Api::V2::Administration::CampaignTemplateResource < Api::V2::Administration::BaseResource
  attributes :name, :created_at, :updated_at

  has_one :owner
  has_one :assessment
  has_one :report

  ransack_filters %i[filterable_fields]

  def created_at
    @model.decorate.created_at
  end

  def updated_at
    @model.decorate.updated_at
  end

  def self.sortable_fields(context)
    super + %i[report.name owner.name assessment.name]
  end
end
