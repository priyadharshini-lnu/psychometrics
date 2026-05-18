# frozen_string_literal: true

# Active Storage with `track_variants = true` uses VariantWithRecord to store
# variant images. By default, the variant's image blob key is generated using
# ActiveStorage's random secure token, which places it at the root of the
# storage bucket instead of under the parent blob's custom path.
#
# This patch overrides `create_or_find_record` to inject the canonical key:
#   <parent_blob_directory>/variants/<sha256(variation.key)>
#
# For example, if the original blob key is:
#   public/library/42/file/abc123_photo.png
# The variant key will be:
#   public/library/42/file/variants/blob_id/<sha256>
#
# This keeps variants co-located with their parent blob inside the same
# folder, preserving the public/private path prefix and making it easy to
# delete all objects for a given attachment in one prefix sweep.
module ActiveStorageVariantKeyPatch
  private

  def create_or_find_record(image:)
    parent_dir = File.dirname(blob.key)
    # Use blob.id for uniqueness
    variant_key = "#{parent_dir}/variants/#{blob.id}/#{OpenSSL::Digest::SHA256.hexdigest(variation.key)}"
    super(image: image.merge(key: variant_key))
  end
end

Rails.application.config.to_prepare do
  ActiveStorage::VariantWithRecord.prepend(ActiveStorageVariantKeyPatch)
end
