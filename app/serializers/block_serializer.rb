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
  attributes :id, :name, :position, :deleted, :props, :created_at, :template_id

  #
  has_many :questions do
    object.questions.
      selecting { ['questions.*',
                   coalesce(template.props, props).as('props'),
                   coalesce(template.type, type).as('type'),
                   coalesce(template.name, name).as('name'),
                   '(CASE WHEN templates_questions.id IS NOT NULL THEN templates_questions.deleted_at ELSE questions.deleted_at END) AS deleted_at',
                   '(CASE WHEN blocks.template_id IS NOT NULL THEN templates_questions.position ELSE questions.position END) AS reposition'] }.
      joining { template.outer }.
      joining { block }.
      where.has { (template.disabled == false) | (template.id == nil) }.
      reorder('reposition ASC')
  end

  def deleted
    !!object.deleted_at
  end

  def created_at
    I18n.l object.created_at, format: :short
  end
end
