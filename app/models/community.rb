class Community < ApplicationRecord
  # Relationships
  belongs_to :user
  has_many :submissions
end
