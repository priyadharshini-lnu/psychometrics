# frozen_string_literal: true

module ActiveStorageAttachable
  extend ActiveSupport::Concern

  DEFAULT_VARIANTS = {
    thumb: { resize_to_fill: [50, 50] },
    small: { resize_to_fill: [150, 150] },
    medium: { resize_to_fill: [350, 350] },
    icon: { resize_to_fit: [50, 50] }
  }.freeze

  # rubocop:disable Metrics/BlockLength
  # rubocop:disable Naming/PredicateName
  class_methods do
    def has_one_attachment(attribute, content_type: nil, service: Settings.storage.public_storage_service)
      has_one_attached attribute, service: service

      # validating allowed content_types
      validates attribute, content_type: content_type if content_type

      # setting folder to store attachment on the storage
      generate_attachment_key_for attribute
    end

    def has_one_image_attachment(
      attribute,
      content_type: %w[jpg jpeg gif png bmp svg],
      service: Settings.storage.public_storage_service,
      variants: nil
    )
      has_one_attached attribute, service: service do |attachable|
        attach_variants(attachable, variants)
      end

      validates attribute, content_type: content_type if content_type

      # setting folder to store attachment on the storage
      generate_attachment_key_for attribute

      define_method "#{attribute}_url" do |variant|
        send(attribute).variant(variant)&.processed&.url
      end
    end

    def has_many_attachments(attribute, content_type: nil, service: Settings.storage.public_storage_service)
      has_many_attached attribute, service: service

      validates attribute, content_type: content_type if content_type

      # setting folder to store attachment on the storage
      generate_attachments_keys_for attribute
    end

    def has_many_image_attachments(
      attribute,
      content_type: %w[jpg jpeg gif png bmp svg],
      service: Settings.storage.public_storage_service,
      variants: nil
    )
      has_many_attached attribute, service: service do |attachable|
        attach_variants(attachable, variants)
      end

      validates attribute, content_type: content_type if content_type

      # setting folder to store attachment on the storage
      generate_attachments_keys_for attribute
    end

    private

    def attach_variants(attachable, variants)
      return if variants.blank?

      variants.each do |variant|
        attachable.variant(variant, DEFAULT_VARIANTS[variant])
      end
    end

    def attachment_storage_path(attribute_name, filename)
      raise NotImplementedError, 'Specify :attachment_storage_path directly on your model'
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
  end

  def disk_service?(blob)
    # NOTE: weird behavior when using different storage service, e.g. 'class.name' comparison is used here
    # when ::DiskService is not used, ActiveStorage raises uninitialized constant error
    blob.service.class.name == 'ActiveStorage::Service::DiskService' # rubocop:disable Style/ClassEqualityComparison
  end
end
# rubocop:enable all
