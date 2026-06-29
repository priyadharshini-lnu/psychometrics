# frozen_string_literal: true

class Api::V2::Administration::DataReportJobResource < Api::V2::Administration::BaseResource
  attributes :status, :created_at, :file

  has_one :created_by, class_name: 'User'

  ransack_filters %i[data_report_owner_id_eq]

  def file
    @model.file&.url
  end

  def self.records(options)
    data_report = DataReport.find(options[:context][:params][:data_report_id])
    client_id = data_report.scope_global? ? nil : data_report.owner_id
    Api::Administration::DataReportJobPolicy::Scope.new(
      options[:context][:user],
      data_report.data_report_jobs,
      filter: { client_id: client_id }
    ).resolve
  end
end
