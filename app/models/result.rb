# == Schema Information
#
# Table name: results
#
#  id            :integer          not null, primary key
#  status        :string
#  step          :integer
#  props         :json
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  user_id       :integer
#  client_id     :integer
#  assessment_id :integer
#

class Result < ApplicationRecord

  belongs_to :assessment
  belongs_to :client
  belongs_to :user

  STATUSES = {
      not_started: 'not_started',
      in_progress: 'in_progress',
      complete: 'complete'
  }.freeze

  enum status: STATUSES

  before_create :init

  def init
    self.status ||= Result.statuses['not_started']
    self.step = 0
  end
end
