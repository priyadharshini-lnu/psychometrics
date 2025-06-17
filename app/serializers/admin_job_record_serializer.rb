# frozen_string_literal: true

class AdminJobRecordSerializer < Panko::Serializer
  attributes :id, :operation, :progress, :data, :status, :error_messages, :content, :read, :created_at, :is_valid,
             :exception, :title_link, :details

  has_many :subjobs, serializer: AdminJobRecordSerializer

  def title_link
    return unless is_valid

    object.job_operation_instance.generate_title_link
  end

  def is_valid
    object.job_operation_instance.valid?
  end

  def details
    return unless is_valid

    object.job_operation_instance.generate_details
  end
end
