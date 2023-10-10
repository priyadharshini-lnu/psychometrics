# frozen_string_literal: true

class Comment < ApplicationRecord
  audited

  belongs_to :question
  belongs_to :creator, class_name: 'User', foreign_key: :created_by
  belongs_to :commentable, polymorphic: true
end
