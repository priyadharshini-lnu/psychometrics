# frozen_string_literal: true

module ActiveStorageAttachable
  extend ActiveSupport::Concern

  # rubocop:disable Style/ClassVars
  # rubocop:disable Metrics/BlockLength
  # rubocop:disable Naming/PredicateName
  class_methods do
    @@attachment_variants ||= Hash.new([])

    # TODO: refactor after rails 7 update
    # NOTE: rails 7 has possibility to create pre-defined variants oob
    def has_one_attachment(
      attribute,
      content_type: nil,
      service: Settings.storage.public_storage_service,
      variants: nil
    )
      # declaring :has_one_attached
      has_one_attached attribute, service: service

      # validating allowed content_types
      validates attribute, content_type: content_type if content_type

      # storing variants to pre-generate
      @@attachment_variants[attribute] |= variants if variants

      # setting folder to store attachment on the storage
      generate_attachment_key_for attribute
    end

    def has_one_image_attachment(
      attribute,
      content_type: %w[jpg jpeg gif png bmp svg],
      service: Settings.storage.public_storage_service,
      variants: nil
    )
      has_one_attachment(attribute, content_type: content_type, service: service, variants: variants)
    end

    def has_many_attachments(
      attribute,
      content_type: nil,
      service: Settings.storage.public_storage_service
    )
      # declaring :has_one_attached
      has_many_attached attribute, service: service

      # validating allowed content_types
      validates attribute, content_type: content_type

      # setting folder to store attachment on the storage
      generate_attachments_keys_for attribute
    end

    def generate_attachment_key_for(attribute)
      define_method "#{attribute}=" do |attachable|
        action = super attachable

        return action unless action.is_a? ActiveStorage::Attached::Changes::CreateOne
        return action if disk_service?(action.blob)

        # TODO: remove after ActiveStorage migration
        attribute = action.name.remove('as_')
        attribute_name = attribute == 'pdf' ? 'pdf_file' : attribute
        # end of to-do

        # By-pass as base64'ed attachments are treated as a Hash
        filename = attachable.is_a?(Hash) ? attachable.fetch(:filename) : attachable.original_filename

        action.blob.key = attachment_storage_path(
          attribute_name,
          "#{action.blob.class.generate_unique_secure_token}_#{filename}"
        )
      end
    end

    def generate_attachments_keys_for(attribute)
      define_method "#{attribute}=" do |attachable|
        action = super attachable

        return action unless action.is_a? ActiveStorage::Attached::Changes::CreateMany
        return action if action.blobs.any? { |blob| disk_service?(blob) }

        # TODO: remove after ActiveStorage migration
        attribute_name = action.name.remove('as_')

        action.blobs.each do |blob|
          blob.key = attachment_storage_path(
            attribute_name,
            "#{blob.class.generate_unique_secure_token}_#{blob.filename}"
          )
        end
      end
    end

    def attachment_storage_path(attribute_name, filename)
      raise NotImplementedError, 'Specify :attachment_storage_path directly on your model'
    end

    def attachment_variants
      @@attachment_variants
    end
  end

  def disk_service?(blob)
    # NOTE: weird behavior when using different storage service, e.g. 'class.name' comparison is used here
    # when ::DiskService is not used, ActiveStorage raises uninitialized constant error
    blob.service.class.name == 'ActiveStorage::Service::DiskService' # rubocop:disable Style/ClassEqualityComparison
  end
end
# rubocop:enable all
