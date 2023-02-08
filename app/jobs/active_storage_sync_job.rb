# frozen_string_literal: true

class ActiveStorageSyncJob < ApplicationJob
  def perform(record_id, record_model, attribute)
    record = record_model.find(record_id)

    return if record.send(attribute).blank?

    sync_activestorage(record, attribute)
  end

  def sync_activestorage(record, attribute)
    carrierwave_attachment = Array.wrap(record.send(attribute))
    carrierwave_attachment.each do |attachment|
      attach_attribute(record, attachment, attribute)
    end
  end

  def attach_attribute(record, attachment, attribute)
    attachment.cache_stored_file!
    # workaround for UserReport, as in future when migrated to ActiveStorage it will conflict
    # with :pdf attribute for UserReport model
    as_attribute = attribute == 'pdf' ? 'pdf_file' : attribute

    record.skip_active_storage_sync = true
    record.send("as_#{as_attribute}").attach(
      io: attachment.sanitized_file.file,
      content_type: attachment.content_type,
      filename: record.attributes[attribute.to_s]
    )
    record.save!
  end
end
