# frozen_string_literal: true

module Dummy
  class PostResource < Dummy::BaseResource
    model_name 'Dummy::Post'

    attributes :title

    has_one :author
    has_many :comments, acts_as_set: true

    audit_log_for :index, payload: '*'
    audit_log_for :show, payload: '*'
    audit_log_for :create, payload: '*'
    audit_log_for :update, payload: '*'
    audit_log_for :destroy, payload: '*'
    audit_log_for :show_relationship, payload: '*'
    audit_log_for :show_related_resource, payload: '*'
    audit_log_for :show_related_resources, payload: '*'
    audit_log_for :replace_to_one_relationship, payload: '*'
    audit_log_for :remove_to_one_relationship, payload: '*'
    audit_log_for :create_to_many_relationships, payload: '*'
    audit_log_for :replace_to_many_relationships, payload: '*'
    audit_log_for :remove_to_many_relationships, payload: '*'
  end
end
