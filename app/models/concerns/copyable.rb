module Copyable
  extend ActiveSupport::Concern

  def gen_uniq_name
    while self.class.exists?(name: name)
      number = name.scan(/\((\d+)\)$/).flatten.join('').to_i
      if number == 0
        self.name = "#{name} (1)"
      else
        self.name.gsub!(/\((\d+)\)$/, "(#{number + 1})")
      end
    end
  end
end