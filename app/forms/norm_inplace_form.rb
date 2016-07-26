class NormInplaceForm < BaseForm
  attr_accessor :factor_type, :norm_type
  validates :norm_type, inclusion: { in: FactorsNorm::NORM_TYPES }, allow_nil: true
  validates :factor_type, inclusion: { in: FactorsNorm::FACTOR_TYPES }, allow_nil: true

  def initialize(data)
    super(data)
    @norm_type = 'eti' unless @norm_type == 'yti'
    @factor_type = 'factors' unless @factor_type == 'sub_factors'
  end
end
