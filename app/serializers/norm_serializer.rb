# == Schema Information
#
# Table name: norms
#
#  id           :integer          not null, primary key
#  name         :string
#  disabled     :boolean          default(FALSE)
#  created_by   :integer
#  updated_by   :integer
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  dimension_id :integer
#

class NormSerializer < ActiveModel::Serializer
  attributes :id, :name
end
