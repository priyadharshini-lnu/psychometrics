# frozen_string_literal: true

class AdminJobRecordSerializer < Panko::Serializer
  attributes :id, :operation, :progress, :data, :status, :error_messages, :content, :read, :created_at, :is_valid,
             :exception, :title_link, :details

  def title_link
    return unless is_valid

    AdminJob::JOBS[object.operation.to_sym].generate_title_link(object)
  end

  def is_valid
    AdminJob::JOBS[object.operation.to_sym].valid?(object)
  end

  def details
    return unless is_valid

    AdminJob::JOBS[object.operation.to_sym].generate_details(object)
  end
end
