# frozen_string_literal: true

class Api::V2::Administration::Clients::IdpTemplateResource < Api::V2::Administration::BaseResource
  attributes :name, :description

  ransack_filters %i[name_cont id_eq]

  def self.records(opts = {})
    Api::Administration::IdpTemplatePolicy::Scope.new(
      opts[:context][:user],
      IdpTemplate,
      project_id: opts[:context][:params]['client_id']
    ).resolve
  end
end
