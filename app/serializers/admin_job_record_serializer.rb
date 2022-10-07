# frozen_string_literal: true

class AdminJobRecordSerializer < ActiveModel::Serializer
  attributes :id, :operation, :progress, :data, :status, :error_messages, :content, :read, :created_at, :is_valid
  attribute :title_link, if: :is_valid
  attribute :details, if: :is_valid

  def title_link
    AdminJob::JOBS[object.operation.to_sym].generate_title_link(object)
  end

  def is_valid
    AdminJob::JOBS[object.operation.to_sym].valid?(object)
  end

  def details
    AdminJob::JOBS[object.operation.to_sym].generate_details(object)
  end
end
