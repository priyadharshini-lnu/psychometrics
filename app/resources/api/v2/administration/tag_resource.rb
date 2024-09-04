# frozen_string_literal: true

class Api::V2::Administration::TagResource < Api::V2::Administration::BaseResource
  model_name 'ActsAsTaggableOn::Tag'
  attributes :name

  ransack_filters %i[name_cont]

  def self.records(opts = {})
    Api::Administration::TagPolicy::Scope.new(opts[:context][:user], nil).resolve
  end
end
