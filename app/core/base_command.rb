class BaseCommand < Rectify::Command
  def self.call!(*args)
    call(*args)[:ok]
  end
end
