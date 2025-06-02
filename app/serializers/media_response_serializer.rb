# frozen_string_literal: true

class MediaResponseSerializer < Panko::Serializer
  attributes :id, :user_selected, :filename, :question_id, :url, :created_at, :encoded_file_url, :file_extension

  def url
    object.asset.url(expires_in: 1.week)
  end

  def encoded_file_url
    url ? URI.encode_www_form_component(url) : nil
  end

  def file_extension
    url ? Pathname(url.split('?')[0]).extname.downcase : nil
  end
end
