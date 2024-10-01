# frozen_string_literal: true

class Dimension < ApplicationRecord
  audited

  include Copyable
  include RansackSearchableFields
  include OwnerValidations

  belongs_to :owner, class_name: 'Client'
  has_many :factors, -> { roots.order(id: :asc) }
  has_many :occupations, dependent: :destroy
  has_many :all_factors, class_name: 'Factor', dependent: :destroy
  has_many :assessments
  has_many :norms, dependent: :destroy
  has_many :innovation_styles, dependent: :destroy

  belongs_to :created_by, class_name: 'User'
  belongs_to :updated_by, class_name: 'User'

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true
  validates :owner, presence: true, allow_nil: true

  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name created_at updated_at]
  end

  def log_attribute_for_delete
    slice(:owner_id, :name)
  end

  def clone_and_save(user_id:)
    @cloned_dimension = deep_clone(
      include: [
        { all_factors: :factors_sub_factors },
        { occupations: { occupations_factors: :factor } },
        { innovation_styles: { innovation_styles_factors: :factor } }
      ],
      use_dictionary: true
    ) do |original, copied|
      original.class.reflect_on_all_attachments.map(&:name).each do |attachment_name|
        attachment = original.public_send(attachment_name)
        next unless attachment.attached?

        copied.copy_and_upload(
          attachment,
          attachment_name
        )
      end
    end

    @cloned_dimension.gen_uniq_name
    @cloned_dimension.created_by_id = @cloned_dimension.updated_by_id = user_id
    if @cloned_dimension.save
      # SubFactors have link to original dimension.
      Factor.where(parent_id: @cloned_dimension.factor_ids).update_all(dimension_id: @cloned_dimension.id)
      @cloned_dimension
    end
  end
end
