# frozen_string_literal: true

# == Schema Information
#
# Table name: comments
#
#  id               :integer          not null, primary key
#  text             :string
#  created_by       :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  commentable_id   :integer
#  commentable_type :string
#

class Comment < ApplicationRecord
  belongs_to :question
  belongs_to :creator, class_name: 'User', foreign_key: :created_by
  belongs_to :commentable, polymorphic: true
end
