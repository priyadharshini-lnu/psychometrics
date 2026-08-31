# frozen_string_literal: true

require 'digest/md5'

module Libraries
  class CreateFromDirectUpload < BaseCommand
    private_attr_reader :params, :current_user

    def initialize(params, current_user)
      @params = params
      @current_user = current_user
    end

    def call
      temporary_upload = current_user.temporary_uploads.pending.find(params[:temporary_upload_id])
      client = Aws::S3::Client.new
      if TemporaryUpload.svg_file?(filename: temporary_upload.filename, content_type: temporary_upload.content_type)
        svg_payload = build_svg_payload(client, temporary_upload)
      end
      checksum = svg_payload ? svg_payload[:checksum] : resolve_checksum(client, temporary_upload)

      library = nil

      permanent_key = nil
      source_copy_path = nil

      ActiveRecord::Base.transaction do
        library = build_library_resource(temporary_upload)
        library.save!(validate: false)
        permanent_key = attach_file_to_library!(library, temporary_upload, checksum, svg_payload)
        source_copy_path = copy_source_path(temporary_upload)

        # Reload so attachment-dependent callbacks/validations see the new file association.
        library.reload
        library.save!
      end

      if svg_payload
        client.put_object(
          bucket: Settings.secrets.s3_compatible_storage[:public_bucket],
          key: permanent_key,
          body: svg_payload[:body],
          content_type: 'image/svg+xml',
          acl: upload_acl
        )
      else
        client.copy_object(
          copy_source: source_copy_path,
          bucket: Settings.secrets.s3_compatible_storage[:public_bucket],
          key: permanent_key,
          acl: upload_acl
        )
      end

      temporary_upload.processed!

      client.delete_object(
        bucket: temporary_upload.bucket,
        key: temporary_upload.file_key
      )

      library.reload

      broadcast(:ok, library)
    rescue ActiveRecord::RecordNotFound, ActiveRecord::RecordInvalid => e
      broadcast(:error, [e.message])
    rescue Aws::Errors::ServiceError => e
      broadcast(:error, ["Cloud Storage Error: #{e.message}"])
    end

    private

    def upload_acl
      Settings.storage.public_storage_service.to_s == 's3_public_bucket' ? 'public-read' : 'private'
    end

    def resolve_checksum(client, temporary_upload)
      return temporary_upload.checksum if temporary_upload.checksum.present?

      object = client.get_object(bucket: temporary_upload.bucket, key: temporary_upload.file_key)
      Digest::MD5.base64digest(object.body.read)
    end

    def build_svg_payload(client, temporary_upload)
      object = client.get_object(
        bucket: temporary_upload.bucket,
        key: temporary_upload.file_key
      )
      raw_svg = object.body.read
      sanitized_svg = sanitize_svg(raw_svg)

      {
        body: sanitized_svg,
        checksum: Digest::MD5.base64digest(sanitized_svg),
        byte_size: sanitized_svg.bytesize,
        content_type: 'image/svg+xml',
        metadata: { sanitized: true }
      }
    end

    def build_library_resource(temporary_upload)
      resource = Library.new(
        name: params[:name].presence || temporary_upload.filename,
        description: params[:description],
        parent_id: params[:parent_id],
        type: params[:type] || 'other'
      )

      resource.created_by = current_user
      resource.updated_by = current_user
      resource.owner_id = params[:owner_id].presence
      if current_user.is?(:client_admin) && resource.owner_id.blank?
        resource.owner_id = Current.client&.id
      end
      resource.tenant_id = resource.owner_id
      resource
    end

    def attach_file_to_library!(library, temporary_upload, checksum, svg_payload = nil)
      blob = ActiveStorage::Blob.new(
        filename: temporary_upload.filename,
        content_type: svg_payload ? svg_payload[:content_type] : temporary_upload.content_type,
        byte_size: svg_payload ? svg_payload[:byte_size] : temporary_upload.byte_size,
        checksum: checksum,
        service_name: Settings.storage.public_storage_service,
        metadata: svg_payload ? svg_payload[:metadata] : {}
      )

      # We manually generate the key following the Library attachment_storage_path standard format
      dummy_token = ActiveStorage::Blob.generate_unique_secure_token
      permanent_key = library.attachment_storage_path(:file, "#{dummy_token}_#{temporary_upload.filename}")

      blob.key = permanent_key
      blob.save!(validate: false)

      ActiveStorage::Attachment.create!(
        record: library,
        blob: blob,
        name: 'file'
      )

      permanent_key
    end

    def copy_source_path(temporary_upload)
      encoded_key = URI.encode_uri_component(temporary_upload.file_key.to_s)
      "#{temporary_upload.bucket}/#{encoded_key}"
    end

    def sanitize_svg(unsafe_xml)
      unsafe_xml = unsafe_xml.to_s
      unsafe_xml.force_encoding('UTF-8')
      Loofah.xml_document(unsafe_xml).scrub!(svg_scrubber).to_s
    end

    def svg_scrubber
      Loofah::Scrubber.new do |node|
        node.remove if node.name == 'script'
      end
    end
  end
end
