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

class ResultSerializer < ActiveModel::Serializer
  attributes :id, :status, :step, :props
end
