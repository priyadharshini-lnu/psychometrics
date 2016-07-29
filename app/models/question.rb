# == Schema Information
#
# Table name: questions
#
#  id         :integer          not null, primary key
#  name       :string
#  position   :integer
#  type       :string
#  props      :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  block_id   :integer
#

class Question < ApplicationRecord

end
