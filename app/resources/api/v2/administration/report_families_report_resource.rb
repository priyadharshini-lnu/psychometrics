# frozen_string_literal: true

class Api::V2::Administration::ReportFamiliesReportResource < Api::V2::Administration::BaseResource
  attributes :name, :created_at, :updated_at, :report_id, :external_package_id, :bundle_name

  ransack_filters %i[filterable_fields]

  has_one :report

  before_create do
    @model.report_family_id = context[:report_family].id
  end

  def name
    @model.report.name
  end

  def bundle_name
    @model.report_family.name
  end

  def created_at
    @model.report.decorate.created_at
  end

  def report_id
    @model.report.id.to_s
  end

  def updated_at
    @model.report.decorate.updated_at
  end

  def self.records(opts)
    super(opts).includes(:report, :report_family).where(report_family: opts[:context][:params][:report_family_id])
  end

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::ReportFamiliesReportPolicy,
          context[:user],
          @model,
          %w[manage],
          {
          }
        )
      }
    }
  end
end
