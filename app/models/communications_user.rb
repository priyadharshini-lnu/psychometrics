class CommunicationsUser < ApplicationRecord
  belongs_to :user
  belongs_to :communication
end
