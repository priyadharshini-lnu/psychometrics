# == Schema Information
#
# Table name: blocks
#
#  id            :integer          not null, primary key
#  name          :string
#  position      :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  assessment_id :integer
#  deleted_at    :datetime
#  props         :json
#

class BlockSerializer < ActiveModel::Serializer
  attributes :id, :name, :position, :deleted, :props, :created_at

  has_many :questions

  def deleted
    !!object.deleted_at
  end

  def props
    JSON.parse(object.props) if object.props
  end
end
