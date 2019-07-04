class MediaResponse < ApplicationRecord

  mount_uploader :asset, MediaResponseUploader

  belongs_to :users_assessment
  belongs_to :question

end
