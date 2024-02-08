# frozen_string_literal: true

class Api::V2::Administration::UserProfileResource < Api::V2::Administration::BaseResource
  attributes :photo_url, :user_id, :locale, :timezone, :age, :gender
  def photo_url
    # TODO: refactor after ActiveStorage migration
    @model.photo.url
  end
end
