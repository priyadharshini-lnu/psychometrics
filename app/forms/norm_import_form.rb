class NormImportForm < AbstractForm
  attr_accessor :file

  validates :file, presence: true
end