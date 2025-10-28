# frozen_string_literal: true

# rubocop:disable Naming/PredicatePrefix

module ActiveStorageAttachable
  extend ActiveSupport::Concern

  DEFAULT_VARIANTS = {
    thumb: { resize_to_fill: [50, 50] },
    small: { resize_to_fill: [150, 150] },
    medium: { resize_to_fill: [350, 350] },
    icon: { resize_to_fit: [50, 50] }
  }.freeze

  # rubocop:disable Metrics/BlockLength
  included do
    def attachment_url(attribute, variant = nil)
      attachment = send(attribute)

      return unless attachment.attached?

      begin
        return attachment.variant(variant)&.processed&.url if variant && attachment.variable?
      rescue ActiveStorage::FileNotFoundError
        return nil
      end

      attachment&.url
    end

    def assign_key_to_blob(action, attribute, filename)
      action.blob.key = attachment_storage_path(
        attribute,
        "#{action.blob.class.generate_unique_secure_token}_#{filename}"
      )
    end

    def copy_and_upload(attachment, attribute)
      file_content = attachment.download
      send(attribute).attach(
        io: StringIO.new(file_content),
        filename: attachment.filename,
        content_type: attachment.content_type
      )
    rescue ActiveStorage::FileNotFoundError => e
      Rails.logger.error(
        "ActiveStorage Error: #{e.message} attachment_type: #{attachment.class.name} record_id: #{attachment.id}"
      )
    end

    after_create do
      customize_attachment_path
    end
  end
  # rubocop:enable Metrics/BlockLength

  def customize_attachment_path
    self.class.attachment_reflections.each_key do |attribute|
      next unless send(attribute).attached?

      attachment = send(attribute)

      if attachment.is_a?(ActiveStorage::Attached::One)
        attachment.blob.key = attachment_storage_path(attribute, attachment.blob.filename)
      else
        attachment.blobs.each do |blob|
          blob.key = attachment_storage_path(attribute, blob.filename)
        end
      end
    end
  end

  # rubocop:disable Metrics/BlockLength
  class_methods do
    def has_one_attachment(
      attribute,
      content_type: nil,
      service: Settings.storage.public_storage_service,
      variants: nil
    )
      has_one_attached attribute, service: service do |attachable|
        attach_variants(attachable, variants)
      end

      define_method :"#{attribute}_url" do |variant = nil|
        attachment_url(attribute, variant)
      end

      # validating allowed content_types
      validates attribute, content_type: content_type if content_type

      # setting folder to store attachment on the storage
      generate_attachment_key_for attribute

      define_method :"#{attribute}_url" do |variant = nil|
        attachment_url(attribute, variant)
      end

      define_method :"purge_#{attribute}=" do |value|
        instance_variable_set(:"@purge_#{attribute}", value)
      end

      define_method :"purge_#{attribute}?" do
        instance_variable_get(:"@purge_#{attribute}")
      end

      after_update lambda {
        if send(:"purge_#{attribute}?") && send(attribute).attached?
          send(attribute).purge_later
        end
      }
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

      define_method :"#{attribute}_url" do |variant = nil|
        attachment_url(attribute, variant)
      end

      define_method :"purge_#{attribute}=" do |value|
        instance_variable_set(:"@purge_#{attribute}", value)
      end

      define_method :"purge_#{attribute}?" do
        instance_variable_get(:"@purge_#{attribute}")
      end

      after_update lambda {
        if send(:"purge_#{attribute}?") && send(attribute).attached?
          send(attribute).purge_later
        end
      }
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
      define_method :"#{attribute}=" do |attachable|
        action = super(attachable)

        return action unless action.is_a? ActiveStorage::Attached::Changes::CreateOne
        return action if disk_service?(action.blob)

        # By-pass as base64'ed attachments are treated as a Hash
        filename = if attachable.is_a?(Hash)
                     attachable.fetch(:filename)
                   elsif (attachment = send(attribute)) && attachment.attached? && attachment.blob.filename.present?
                     attachment.blob['filename']
                   else
                     attachable&.original_filename
                   end
        assign_key_to_blob(action, attribute, filename)
      end
    end

    def generate_attachments_keys_for(attribute)
      define_method :"#{attribute}=" do |attachable|
        action = super(attachable)

        return action unless action.is_a? ActiveStorage::Attached::Changes::CreateMany
        return action if action.blobs.any? { |blob| disk_service?(blob) }

        action.blobs.each do |blob|
          blob.key = attachment_storage_path(
            attribute,
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
