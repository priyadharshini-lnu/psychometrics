# frozen_string_literal: true

class AdminJobRecordSerializer < ActiveModel::Serializer
  attributes :id, :operation, :progress, :data, :status, :error_messages, :content, :read, :created_at, :title_link,
             :details

  def title_link
    AdminJob::JOBS[object.operation.to_sym].generate_title_link(object)
  end

  def details
    AdminJob::JOBS[object.operation.to_sym].generate_details(object)
  end
end
