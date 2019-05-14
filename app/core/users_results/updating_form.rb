module UsersResults
  class UpdatingForm < Rectify::Form
    attribute :status, Integer
    attribute :answers, Hash, default: nil

    # TODO: need to check why is needed for and complete implementation
    # attribute :embedded_data, Hash, default: nil
    # attribute :norm_data, Hash, default: nil
  end
end
