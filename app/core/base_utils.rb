class BaseUtils
  class << self
    def safe_constantize(class_name)
      class_name.constantize
    rescue NameError => e
      nil
    end
  end
end
