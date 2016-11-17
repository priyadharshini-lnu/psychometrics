class Translation < ApplicationRecord
  belongs_to :translateable, polymorphic: true

  validates :locale, presence: true
  validates :translateable_type, uniqueness: { scope: [:translateable_id, :locale] }

  scope :to_questions, -> { where(translateable_type: 'Question') }
  scope :for_assessment, lambda { |assessment_id|
    joining { translateable.of(Question).block }.where('blocks.assessment_id = ?', assessment_id)
  }
end
