# frozen_string_literal: true

class MediaResponseSerializer < ActiveModel::Serializer
  attributes :id, :user_selected, :filename, :question_id, :url, :created_at

  def url
    object.asset.url
  end
end
