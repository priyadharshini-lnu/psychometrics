# frozen_string_literal: true

class Api::V2::Administration::JobRoleResource < Api::V2::Administration::BaseResource
  attributes :name, :description, :code, :job_group_id, :project_id, :updated_at

  has_one :project
  has_one :job_group

  ransack_filters %i[name_or_code_cont project_id_eq include_global_roles global]

  def self.sortable_fields(context)
    super + %i[project.name]
  end

  def project_id
    @model.project_id.to_s
  end

  def job_group_id
    @model.job_group_id.to_s
  end

  def updated_at
    @model.decorate.updated_at
  end

  def self.records(opts = {})
    project_id = opts[:context][:project]&.id ||
                 opts[:context][:params].dig('query', 'project_id')&.to_i

    ::Api::Administration::JobRolePolicy::Scope.new(
      opts[:context][:user], ::JobRole,
      { project_id: project_id,
        filter: opts[:context][:filter] }
    ).resolve.
      includes(:translations)
  end
end
