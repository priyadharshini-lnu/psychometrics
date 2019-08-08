class MediaResponse < ApplicationRecord

  mount_uploader :asset, MediaResponseUploader

  belongs_to :users_assessment
  belongs_to :question
  belongs_to :assign
  belongs_to :users_result

end
