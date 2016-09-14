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

  has_many :questions do
    object.questions.
      selecting { [ 'questions.*',
                    coalesce(template.props, props).as('props'),
                    coalesce(template.type, type).as('type'),
                    coalesce(template.name, name).as('name') ] }.
      joining { template.outer }.
      where.has { (template.disabled == false) | (template.id == nil) }
  end

  def deleted
    !!object.deleted_at
  end

  def created_at
    I18n.l object.created_at, format: :short
  end
end
