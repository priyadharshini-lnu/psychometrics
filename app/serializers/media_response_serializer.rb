# frozen_string_literal: true

class MediaResponseSerializer < Panko::Serializer
  attributes :id, :user_selected, :filename, :question_id, :url, :created_at

  def url
    object.asset.url(expires_in: 1.week)
  end
end
