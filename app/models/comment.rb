# == Schema Information
#
# Table name: comments
#
#  id          :integer          not null, primary key
#  text        :string
#  created_by  :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  question_id :integer
#

class Comment < ApplicationRecord

end
