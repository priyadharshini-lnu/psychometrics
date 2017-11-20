module Forms
  class Base < Reform::Form
    include Reform::Form::ActiveModel::ModelReflections
  end
end
