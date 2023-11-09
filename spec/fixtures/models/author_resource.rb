# frozen_string_literal: true

module Dummy
  class AuthorResource < BaseResource
    model_name 'Dummy::Author'

    attributes :name

    has_one :campaign
    has_many :comments

    ransack_filters %i[campaign_id_eq]

    audit_log_for :index, payload: '*', if: ->(context, _) { context[:params][:log] == 'true' }
    audit_log_for :show, parent_resource: ->(_, record) { { campaign: record.campaign } }
    audit_log_for :create, payload: lambda { |context, _record_class|
                                      { user: context[:user].id, attrs: context[:params][:data][:attributes] }
                                    }
    audit_log_for :update, payload: :log_details_for_update

    def self.log_details_for_update(context, record)
      { user: context[:user].id, updated_name: context[:params][:data][:attributes][:name], record_id: record.id }
    end
  end
end
