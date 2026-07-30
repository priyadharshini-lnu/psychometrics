# frozen_string_literal: true

class Api::V2::Administration::CampaignTemplateResource < Api::V2::Administration::BaseResource
  attributes :name, :created_at, :updated_at

  has_one :owner
  has_one :assessment
  has_one :report
  has_one :campaign

  ransack_filters %i[filterable_fields]

  def self.records(opts)
    super.includes(
      assessment: [:translations, :created_by, :updated_by,
                   { icon_attachment: :blob }, { poster_attachment: :blob }],
      report: [:created_by, :updated_by,
               { icon_attachment: :blob }, { poster_attachment: :blob }],
      owner: { client_design_setting: { logo_attachment: :blob } },
      campaign: %i[default_idp_template dashboard threesixty_campaign]
    )
  end

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
