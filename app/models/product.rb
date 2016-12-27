class Product < ApplicationRecord
  include Copyable
  has_many :product_reports, dependent: :destroy
  has_many :reports, through: :product_reports
  has_many :prices, class_name: 'ProductPrice', dependent: :destroy
  has_many :images, class_name: 'ProductImage', dependent: :destroy
  accepts_nested_attributes_for :prices, reject_if: proc { |attributes| attributes['price_cents'].blank? }, allow_destroy: true
  accepts_nested_attributes_for :images, reject_if: :all_blank, allow_destroy: true

  validates :name, presence: true

  mount_uploader :image, ImageUploader

  scope :enabled, -> { where.not(disabled: true) }
  scope :with_price, lambda { |currency|
    selecting { ['products.*', prices.price_cents, prices.price_currency] }.
      joining { prices.on(prices.product_id.eq(id) & prices.price_currency.eq(currency.upcase)) }
  }

  # It need for add ability sort in Ransack
  # Case ransack don't see attributes wich were select from joining table
  ransacker :price do |_r|
    Arel::Nodes::SqlLiteral.new('price_cents')
  end

  # When we load list of products (scope `with_price`)
  # We join table prices and select price with currency
  # Therefore we need `price` method for parse it to Money object
  def price
    Money.new(price_cents, price_currency)
  end

  # Copy Product with prices, images, and reports
  def clone
    @cloned_item = deep_clone include: [:product_reports, :prices, :images] do |original, kopy|
      kopy.image = original.image if self == original || original.is_a?(ProductImage)
    end
    @cloned_item.gen_uniq_name
    @cloned_item
  end
end
