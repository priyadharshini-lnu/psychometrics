module UsersResults
  class UpdatingForm < Rectify::Form
    attribute :status, Integer
    attribute :results, Hash, default: nil
    attribute :embedded_data, Hash, default: nil
    attribute :norm_data, Hash, default: nil
  end
end
